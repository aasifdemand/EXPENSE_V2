import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as argon2 from 'argon2';
import type { Request } from 'express';

import { User } from 'src/entities/user.entity';
import { AuthDto } from './dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /* ===========================
     LOGIN + QR GENERATION
     =========================== */
  async auth(data: AuthDto, req: Request) {
    const user = await this.userRepository.findOne({
      where: { name: data.name },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await argon2.verify(
      user.password,
      data.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid password');
    }

    let qrCodeDataUrl: string | null = null;

    if (!user.twoFactorSecret) {
      const secret = speakeasy.generateSecret({
        name: `ExpenseManagement:${user.name}`,
        issuer: 'ExpenseManagement',
      });

      user.twoFactorSecret = secret.base32;
      await this.userRepository.save(user);

      qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    }

    req.session.user = { id: user.id, role: user?.role };
    req.session.twoFactorPending = true;
    req.session.twoFactorVerified = false;
    req.session.authenticated = false;
    await this.saveSession(req);

    return {
      qr: qrCodeDataUrl,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        has2FA: !!user.twoFactorSecret,
        twoFactorPending: true,
        twoFactorVerified: false,
        authenticated: false,
      },
    };
  }

  /* ===========================
     GET ALL USERS
     =========================== */
  async getAll(page: number = 1, limit: number = 5) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    if (!users.length) {
      throw new NotFoundException('No users found');
    }

    return {
      count: users.length,
      users: users.map(({ password, twoFactorSecret, ...safe }) => safe),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* ===========================
     VERIFY 2FA
     =========================== */
  async verify2fa(otp: string, req: Request) {
    const userId = req?.session?.user?.id;
    if (!userId) throw new UnauthorizedException('Session expired');

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not configured');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    req.session.twoFactorPending = false;
    req.session.twoFactorVerified = true;
    req.session.authenticated = true;
    await this.saveSession(req);

    return {
      message: '2FA verification successful',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        authenticated: true,
      },
    };
  }

  /* ===========================
     LOGOUT
     =========================== */
  async logout(req: Request) {
    await new Promise<void>((resolve, reject) =>
      req.session.destroy((err) => (err ? reject(err) : resolve())),
    );
    return { message: 'Logged out successfully' };
  }

  /* ===========================
     SESSION DATA
     =========================== */
  async getSessionData(req: Request) {
    const userId = req?.session?.user?.id;
    if (!userId) throw new UnauthorizedException('Session expired');

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'userLoc',
        'spentAmount',
        'reimbursedAmount',
        'allocatedAmount',
        'budgetLeft',
      ],
    });

    return {
      user,
      twoFactorPending: req.session.twoFactorPending,
      authenticated: req.session.authenticated,
    };
  }

  /* ===========================
     CREATE USER
     =========================== */
  async createNewUser(dto: CreateUserDto) {
    const exists = await this.userRepository.findOne({
      where: { name: dto.name },
    });
    if (exists) throw new BadRequestException('User already exists');

    const user = this.userRepository.create({
      ...dto,
      password: await argon2.hash(dto.password),
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      userLoc: user.userLoc,
    };
  }

  /* ===========================
     UPDATE PROFILE
     =========================== */
  async updateProfile(dto: UpdateProfileDto, userId: string) {
    if (!userId) throw new BadRequestException('Invalid user ID');

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (emailExists) throw new ConflictException('Email already exists');
    }

    if (dto.phone && dto.phone !== user.phone) {
      const phoneExists = await this.userRepository.findOne({
        where: { phone: dto.phone },
      });
      if (phoneExists) throw new ConflictException('Phone already exists');
    }

    if (dto.password) {
      dto.password = await argon2.hash(dto.password);
    }

    this.userRepository.merge(user, dto);
    const updated = await this.userRepository.save(user);

    const { password, twoFactorSecret, ...safe } = updated;
    return safe;
  }

  /* ===========================
     RESET PASSWORD
     =========================== */
  async resetUserPassword(userId: string, newPassword: string) {
    if (!userId) throw new BadRequestException('Invalid user ID');
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password too short');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    user.password = await argon2.hash(newPassword);
    await this.userRepository.save(user);

    return {
      message: 'Password reset successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /* ===========================
     SESSION SAVE
     =========================== */
  private async saveSession(req: Request) {
    await new Promise<void>((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve())),
    );
  }
}
