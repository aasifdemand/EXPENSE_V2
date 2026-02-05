import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { ReimbursementService } from './reimbursement.service';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import { UserLocation, UserRole } from 'src/enums/user.enum';


@Controller('reimbursement')
export class ReimbursementController {
  constructor(
    private readonly reimbursementService: ReimbursementService,
  ) { }

  /* =====================================================
     GET ALL REIMBURSEMENTS (ADMIN VIEW)
     ===================================================== */
  @Get()
  @UseGuards(CsrfGuard)
  async getAll(
    @Req() req: Request,
    @Query('location') location: UserLocation = UserLocation.OVERALL,
    @Query('status') status?: 'pending' | 'reimbursed',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const session = req.session;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.reimbursementService.getAllReimbursements(
      Number(page),
      Number(limit),
      location,
      status,
    );
  }

  /* =====================================================
     GET REIMBURSEMENTS FOR A USER
     ===================================================== */
  @Get(':id')
  @UseGuards(CsrfGuard)
  async getUserReimbursements(
    @Req() req: Request,
    @Param('id') userId: string,
    @Query('location') location: UserLocation = UserLocation.OVERALL,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const session = req.session;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, please verify your identity first',
      );
    }

    return this.reimbursementService.getUserReimbursements(
      userId,
      Number(page),
      Number(limit),
      location,
    );
  }

  /* =====================================================
     SUPERADMIN UPDATE REIMBURSEMENT STATUS
     ===================================================== */
  @Patch('admin/:id')
  @UseGuards(CsrfGuard)
  async updateReimbursementStatus(
    @Param('id') reimbursementId: string,
    @Body('isReimbursed') isReimbursed: boolean,
    @Req() req: Request,
  ) {
    const session = req.session;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, please verify your identity first',
      );
    }

    if (session.user?.role !== UserRole.SUPERADMIN) {
      throw new UnauthorizedException(
        'Only superadmin can perform this action',
      );
    }

    // Pass minimal User shape expected by service
    return this.reimbursementService.superadminUpdateReimbursement(
      reimbursementId,
      isReimbursed,
      {
        id: session.user?.id,
        role: session.user?.role,
      } as any,
    );
  }
}
