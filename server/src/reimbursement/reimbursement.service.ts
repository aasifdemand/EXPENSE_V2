import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reimbursement } from 'src/entities/reimbursement.entity';
import { User } from 'src/entities/user.entity';
import { Expense } from 'src/entities/expense.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UserLocation, UserRole } from 'src/enums/user.enum';


@Injectable()
export class ReimbursementService {
    constructor(
        @InjectRepository(Reimbursement)
        private readonly reimbursementRepo: Repository<Reimbursement>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Expense)
        private readonly expenseRepo: Repository<Expense>,

        private readonly notificationService: NotificationsService,
    ) { }

    /* =====================================================
     GET ALL REIMBURSEMENTS (ADMIN)
     ===================================================== */
    async getAllReimbursements(
        page = 1,
        limit = 10,
        location: UserLocation = UserLocation.OVERALL,
        status?: 'pending' | 'reimbursed',
    ) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;

        const qb = this.reimbursementRepo
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.requestedBy', 'user')
            .leftJoinAndSelect('r.expense', 'expense')
            .orderBy('r.createdAt', 'DESC')
            .skip(skip)
            .take(safeLimit);

        if (location !== UserLocation.OVERALL) {
            qb.andWhere('user.userLoc = :location', { location });
        }

        if (status === 'pending') {
            qb.andWhere('r.isReimbursed = false');
        }

        if (status === 'reimbursed') {
            qb.andWhere('r.isReimbursed = true');
        }

        const [data, total] = await qb.getManyAndCount();

        /* =====================
           STATS (location aware)
           ===================== */
        const statsQb = this.reimbursementRepo
            .createQueryBuilder('r')
            .leftJoin('r.requestedBy', 'u');

        if (location !== UserLocation.OVERALL) {
            statsQb.andWhere('u.userLoc = :location', { location });
        }

        const stats = await statsQb
            .select([
                'COUNT(r.id) as totalReimbursements',
                'SUM(r.amount) as totalAmount',
                'SUM(CASE WHEN r.isReimbursed = true THEN 1 ELSE 0 END) as totalReimbursed',
                'SUM(CASE WHEN r.isReimbursed = false THEN 1 ELSE 0 END) as totalPending',
                'SUM(CASE WHEN r.isReimbursed = true THEN r.amount ELSE 0 END) as totalReimbursedAmount',
                'SUM(CASE WHEN r.isReimbursed = false THEN r.amount ELSE 0 END) as totalPendingAmount',
            ])
            .getRawOne();

        return {
            message: 'Fetched reimbursements successfully',
            meta: { total, page: safePage, limit: safeLimit },
            stats: {
                totalReimbursements: Number(stats.totalReimbursements || 0),
                totalAmount: Number(stats.totalAmount || 0),
                totalReimbursed: Number(stats.totalReimbursed || 0),
                totalPending: Number(stats.totalPending || 0),
                totalReimbursedAmount: Number(stats.totalReimbursedAmount || 0),
                totalPendingAmount: Number(stats.totalPendingAmount || 0),
            },
            data,
            location,
        };
    }

    /* =====================================================
       SUPERADMIN UPDATE REIMBURSEMENT
       ===================================================== */
    async superadminUpdateReimbursement(
        reimbursementId: string,
        isReimbursed: boolean,
        superadmin: User,
    ) {
        if (superadmin.role !== UserRole.SUPERADMIN) {
            throw new UnauthorizedException('Only Superadmin can perform this action');
        }

        const reimbursement = await this.reimbursementRepo.findOne({
            where: { id: reimbursementId },
            relations: ['requestedBy', 'expense'],
        });

        if (!reimbursement) {
            throw new NotFoundException("Reimbursement record doesn't exist");
        }

        if (reimbursement.isReimbursed === isReimbursed) {
            throw new BadRequestException(
                `Reimbursement is already ${isReimbursed ? 'paid' : 'pending'}`,
            );
        }

        reimbursement.isReimbursed = isReimbursed;
        reimbursement.reimbursedAt = isReimbursed ? new Date() : undefined;

        if (isReimbursed && reimbursement.expense) {
            reimbursement.expense.fromReimbursement = 0;
            await this.expenseRepo.save(reimbursement.expense);
        }

        await this.reimbursementRepo.save(reimbursement);

        const updated = await this.reimbursementRepo.findOne({
            where: { id: reimbursement.id },
            relations: ['requestedBy', 'expense'],
        });

        this.notificationService.sendNotification(
            reimbursement.requestedBy.id,
            isReimbursed
                ? `Your reimbursement of ₹${reimbursement.amount} has been processed.`
                : `Your reimbursement of ₹${reimbursement.amount} was reverted.`,
            isReimbursed ? 'REIMBURSEMENT_APPROVED' : 'REIMBURSEMENT_REVERTED',
        );

        return {
            message: 'Reimbursement updated successfully',
            reimbursement: updated,
        };
    }
    /* =====================================================
       GET REIMBURSEMENTS FOR A USER
       ===================================================== */
    async getUserReimbursements(
        userId: string,
        page = 1,
        limit = 10,
        location: UserLocation = UserLocation.OVERALL,
    ) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);
        const skip = (safePage - 1) * safeLimit;

        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Location safety check (same logic as Mongo version)
        if (location !== UserLocation.OVERALL && user.userLoc !== location) {
            return {
                message: 'Fetched user reimbursements successfully',
                meta: { total: 0, page: safePage, limit: safeLimit },
                stats: {
                    totalReimbursements: 0,
                    totalAmount: 0,
                    totalReimbursed: 0,
                    totalPending: 0,
                    totalReimbursedAmount: 0,
                    totalPendingAmount: 0,
                },
                data: [],
                location,
            };
        }

        const qb = this.reimbursementRepo
            .createQueryBuilder('reimbursement')
            .leftJoinAndSelect('reimbursement.requestedBy', 'user')
            .leftJoinAndSelect('reimbursement.expense', 'expense')
            .where('user.id = :userId', { userId })
            .orderBy('reimbursement.createdAt', 'DESC')
            .skip(skip)
            .take(safeLimit);

        const [data, total] = await qb.getManyAndCount();

        const statsRaw = await this.reimbursementRepo
            .createQueryBuilder('r')
            .where('r.requestedById = :userId', { userId })
            .select([
                'COUNT(r.id) as totalReimbursements',
                'SUM(r.amount) as totalAmount',
                'SUM(CASE WHEN r.isReimbursed = true THEN 1 ELSE 0 END) as totalReimbursed',
                'SUM(CASE WHEN r.isReimbursed = false THEN 1 ELSE 0 END) as totalPending',
                'SUM(CASE WHEN r.isReimbursed = true THEN r.amount ELSE 0 END) as totalReimbursedAmount',
                'SUM(CASE WHEN r.isReimbursed = false THEN r.amount ELSE 0 END) as totalPendingAmount',
            ])
            .getRawOne();

        return {
            message: 'Fetched user reimbursements successfully',
            meta: { total, page: safePage, limit: safeLimit },
            stats: {
                totalReimbursements: Number(statsRaw?.totalReimbursements || 0),
                totalAmount: Number(statsRaw?.totalAmount || 0),
                totalReimbursed: Number(statsRaw?.totalReimbursed || 0),
                totalPending: Number(statsRaw?.totalPending || 0),
                totalReimbursedAmount: Number(statsRaw?.totalReimbursedAmount || 0),
                totalPendingAmount: Number(statsRaw?.totalPendingAmount || 0),
            },
            data,
            location,
        };
    }



}
