import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { Budget } from 'src/entities/budget.entity';
import { User } from 'src/entities/user.entity';
import { Reimbursement } from 'src/entities/reimbursement.entity';
import { UserRole } from 'src/enums/user.enum';

import {
  AllocateBudgetDto,
  UpdateAllocatedBudgetDto,
} from './dto/allocate-budget.dto';
import { SearchBudgetAllocationsDto } from './dto/search-budgets.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Reimbursement)
    private readonly reimbursementRepo: Repository<Reimbursement>,

    private readonly dataSource: DataSource,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /* =====================================================
     ALLOCATE BUDGET
     ===================================================== */
  async allocateBudget(data: AllocateBudgetDto) {
    const { amount, userId, company } = data;

    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const budgetRepo = manager.getRepository(Budget);
      const reimbursementRepo = manager.getRepository(Reimbursement);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const existingReimbursement = await reimbursementRepo.findOne({
        where: {
          requestedBy: { id: userId },
          isReimbursed: false,
        },
      });

      let reimbursementUpdate: Reimbursement | null = null;

      if (existingReimbursement && existingReimbursement.amount > 0) {
        const newAmount = Math.max(0, existingReimbursement.amount - amount);
        existingReimbursement.amount = newAmount;
        reimbursementUpdate = await reimbursementRepo.save(existingReimbursement);
      }

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const budget = budgetRepo.create({
        user,
        allocatedAmount: amount,
        spentAmount: 0,
        remainingAmount: amount,
        month,
        year,
        company,
      });

      await budgetRepo.save(budget);

      user.allocatedAmount += amount;
      user.budgetLeft += amount;
      await userRepo.save(user);

      await this.cacheManager.del('budgets:*');

      return {
        message: 'Budget allocated successfully',
        budget,
        reimbursementUpdate: reimbursementUpdate
          ? { id: reimbursementUpdate.id, newAmount: reimbursementUpdate.amount }
          : null,
      };
    });
  }

  /* =====================================================
     FETCH ALLOCATED BUDGETS (FIXED)
     ===================================================== */
  async fetchAllocatedBudgets(
    page = 1,
    limit = 20,
    userId?: string,
    location?: string,
  ) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const baseQB = this.budgetRepo
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.user', 'user')
      .orderBy('budget.createdAt', 'DESC');

    if (userId) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (user?.role === UserRole.USER) {
        baseQB.andWhere('user.id = :userId', { userId });
      }
    }

    if (location && location !== 'OVERALL') {
      baseQB.andWhere('user.userLoc = :location', { location });
    }

    // ✅ PAGINATED DATA
    const [data, total] = await baseQB
      .clone()
      .skip(skip)
      .take(safeLimit)
      .getManyAndCount();

    // ✅ ALL DATA FOR STATS
    const allBudgets = await baseQB.clone().getMany();

    return {
      message: 'Fetched budgets successfully',
      data,
      allBudgets,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
      },
      location: location || 'OVERALL',
    };
  }

  /* =====================================================
     SEARCH BUDGET ALLOCATIONS (FIXED)
     ===================================================== */
  async searchBudgetAllocations(
    filters: SearchBudgetAllocationsDto,
    session: Record<string, any>,
    location?: string,
  ) {
    const {
      userName,
      month,
      year,
      minAllocated,
      maxAllocated,
      minSpent,
      maxSpent,
      company,
      page = 1,
      limit = 10,
    } = filters;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const qb = this.budgetRepo
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.user', 'user')
      .orderBy('budget.createdAt', 'DESC');

    if (session?.user?.role !== UserRole.SUPERADMIN) {
      qb.andWhere('user.id = :uid', { uid: session.user.id });
    }

    if (month) qb.andWhere('budget.month = :month', { month });
    if (year) qb.andWhere('budget.year = :year', { year });
    if (company) qb.andWhere('budget.company = :company', { company });

    if (minAllocated !== undefined)
      qb.andWhere('budget.allocatedAmount >= :minAllocated', { minAllocated });
    if (maxAllocated !== undefined)
      qb.andWhere('budget.allocatedAmount <= :maxAllocated', { maxAllocated });

    if (minSpent !== undefined)
      qb.andWhere('budget.spentAmount >= :minSpent', { minSpent });
    if (maxSpent !== undefined)
      qb.andWhere('budget.spentAmount <= :maxSpent', { maxSpent });

    if (userName) {
      qb.andWhere('LOWER(user.name) LIKE :userName', {
        userName: `%${userName.toLowerCase()}%`,
      });
    }

    if (location && location !== 'OVERALL') {
      qb.andWhere('user.userLoc = :location', { location });
    }

    // ✅ PAGINATED
    const [data, total] = await qb
      .clone()
      .skip(skip)
      .take(safeLimit)
      .getManyAndCount();

    // ✅ FULL DATA FOR STATS
    const allBudgets = await qb.clone().getMany();

    return {
      message: 'Fetched budgets successfully',
      data,
      allBudgets,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
      },
      location: location || 'OVERALL',
    };
  }

  /* =====================================================
     USER BUDGETS
     ===================================================== */
  async getUserBudgets(userId: string, page = 1, limit = 20) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const [data, total] = await this.budgetRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      message: 'Fetched user budgets successfully',
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
      },
    };
  }

  /* =====================================================
     EDIT ALLOCATED BUDGET
     ===================================================== */
  async editAllocatedBudget(
    id: string,
    data: UpdateAllocatedBudgetDto,
    userId: string,
  ) {
    if (data.amount === undefined) {
      throw new BadRequestException('Allocated amount is required');
    }

    const budget = await this.budgetRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!budget) throw new NotFoundException('Budget not found');

    const newUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!newUser) throw new NotFoundException('User not found');

    budget.allocatedAmount = data.amount;
    budget.remainingAmount = data.amount - budget.spentAmount;
    budget.user = newUser;

    await this.budgetRepo.save(budget);
    await this.cacheManager.del('budgets:*');

    return {
      message: 'Budget updated successfully',
      budget,
    };
  }

  /* =====================================================
     GET BUDGET BY ID
     ===================================================== */
  async getBudgetById(id: string) {
    const budget = await this.budgetRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!budget) throw new NotFoundException('Budget not found');

    return {
      message: 'Fetched budget successfully',
      budget,
    };
  }
}
