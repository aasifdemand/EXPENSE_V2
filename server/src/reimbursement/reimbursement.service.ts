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

    private getPaginationMeta(total: number, page: number, limit: number, location: UserLocation = UserLocation.OVERALL) {
        return {
            total,
            page,
            limit,
            location,
        };
    }

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
            .orderBy('r.createdAt', 'DESC');

        if (location !== UserLocation.OVERALL) {
            qb.andWhere('user.userLoc = :location', { location });
        }

        if (status === 'pending') {
            qb.andWhere('r.isReimbursed = :pending', { pending: false });
        }

        if (status === 'reimbursed') {
            qb.andWhere('r.isReimbursed = :done', { done: true });
        }

        qb.skip(skip).take(safeLimit);

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

        const statsRaw = await statsQb
            .select('COUNT(r.id)', 'totalReimbursements')
            .addSelect('SUM(r.amount)', 'totalAmount')
            .addSelect('SUM(CASE WHEN r.isReimbursed = :statusTrue THEN 1 ELSE 0 END)', 'totalReimbursed')
            .addSelect('SUM(CASE WHEN r.isReimbursed = :statusFalse THEN 1 ELSE 0 END)', 'totalPending')
            .addSelect('SUM(CASE WHEN r.isReimbursed = :statusTrue THEN r.amount ELSE 0 END)', 'totalReimbursedAmount')
            .addSelect('SUM(CASE WHEN r.isReimbursed = :statusFalse THEN r.amount ELSE 0 END)', 'totalPendingAmount')
            .setParameters({ statusTrue: true, statusFalse: false })
            .getRawOne();

        return {
            message: 'Fetched reimbursements successfully',
            meta: this.getPaginationMeta(total, safePage, safeLimit, location),
            stats: {
                totalReimbursements: Number(statsRaw?.totalReimbursements || 0),
                totalAmount: Number(statsRaw?.totalAmount || 0),
                totalReimbursed: Number(statsRaw?.totalReimbursed || 0),
                totalPending: Number(statsRaw?.totalPending || 0),
                totalReimbursedAmount: Number(statsRaw?.totalReimbursedAmount || 0),
                totalPendingAmount: Number(statsRaw?.totalPendingAmount || 0),
            },
            data,
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
            .select('COUNT(r.id)', 'totalReimbursements')
            .addSelect('SUM(r.amount)', 'totalAmount')
            .addSelect('SUM(CASE WHEN r.isReimbursed = :statusTrue THEN 1 ELSE 0 END)', 'totalReimbursed')
            .addSelect('SUM(CASE WHEN r.isReimbursed = :statusFalse THEN 1 ELSE 0 END)', 'totalPending')
            .addSelect('SUM(CASE WHEN r.isReimbursed = :statusTrue THEN r.amount ELSE 0 END)', 'totalReimbursedAmount')
            .addSelect('SUM(CASE WHEN r.isReimbursed = :statusFalse THEN r.amount ELSE 0 END)', 'totalPendingAmount')
            .setParameters({ statusTrue: true, statusFalse: false })
            .getRawOne();

        return {
            message: 'Fetched user reimbursements successfully',
            meta: this.getPaginationMeta(total, safePage, safeLimit, location),
            stats: {
                totalReimbursements: Number(statsRaw?.totalReimbursements || 0),
                totalAmount: Number(statsRaw?.totalAmount || 0),
                totalReimbursed: Number(statsRaw?.totalReimbursed || 0),
                totalPending: Number(statsRaw?.totalPending || 0),
                totalReimbursedAmount: Number(statsRaw?.totalReimbursedAmount || 0),
                totalPendingAmount: Number(statsRaw?.totalPendingAmount || 0),
            },
            data,
        };

    }
}
