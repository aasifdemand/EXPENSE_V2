import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

import { Expense } from 'src/entities/expense.entity';
import { AdminExpense } from 'src/entities/admin-expense.entity';
import { User, } from 'src/entities/user.entity';
import { Budget } from 'src/entities/budget.entity';
import { Department } from 'src/entities/department.entity';
import { SubDepartment } from 'src/entities/sub-department.entity';
import { Reimbursement } from 'src/entities/reimbursement.entity';

import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { SearchExpensesDto } from './dtos/search-expense.dto';

import { ImagekitService } from 'src/services/media.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MailService } from 'src/services/mail.service';
import createExpenseEmailTemplate from './templates/create-expense.template';
import { UserRole } from 'src/enums/user.enum';
import { DateUtil } from 'src/utils/date.util';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,

    @InjectRepository(AdminExpense)
    private readonly adminExpenseRepo: Repository<AdminExpense>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,



    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,

    @InjectRepository(SubDepartment)
    private readonly subDepartmentRepo: Repository<SubDepartment>,



    private readonly dataSource: DataSource,

    private readonly mediaService: ImagekitService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationService: NotificationsService,
    private readonly mailService: MailService,
    private readonly dateUtil: DateUtil
  ) { }

  /* =====================================================
     CREATE EXPENSE (ENTRY POINT)
     ===================================================== */
  async handleCreateExpense(
    dto: CreateExpenseDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    if (!dto.date) {
      throw new BadRequestException('Expense date is required');
    }

    if (dto.expenseType === 'ADMIN') {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'role'],
      });

      if (!user || user.role !== UserRole.SUPERADMIN) {
        throw new ForbiddenException(
          'Only super admins can create admin expenses',
        );
      }

      return this.createAdminExpense(dto, file);
    }

    return this.createUserExpense(dto, userId, file);
  }



  /* =====================================================
     ADMIN EXPENSE
     ===================================================== */
  private async createAdminExpense(
    dto: CreateExpenseDto,
    file?: Express.Multer.File,
  ) {
    const expenseDate = this.dateUtil.parseExpenseDate(dto.date);

    let proof: string | undefined;
    if (file) {
      const uploaded = await this.mediaService.uploadFile(
        file.buffer,
        file.originalname,
        '/admin-expenses',
      );
      proof = uploaded.url;
    }

    const department = await this.departmentRepo.findOneBy({
      id: dto.department,
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    let subDepartment: SubDepartment | undefined;

    if (dto.subDepartment) {
      const found = await this.subDepartmentRepo.findOneBy({
        id: dto.subDepartment,
      });

      if (!found) {
        throw new NotFoundException('SubDepartment not found');
      }

      subDepartment = found; // now always SubDepartment
    }


    const expense = this.adminExpenseRepo.create({
      amount: dto.amount,
      description: dto.description,
      department,
      subDepartment,
      paymentMode: dto.paymentMode,
      vendor: dto.vendor,
      proof,
      date: expenseDate,
    });

    await this.adminExpenseRepo.save(expense);

    return {
      message: 'Admin expense created successfully',
      expense,
    };
  }



  /* =====================================================
     USER EXPENSE (TRANSACTION SAFE)
     ===================================================== */
  private async createUserExpense(
    dto: CreateExpenseDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const expenseRepo = manager.getRepository(Expense);
      const budgetRepo = manager.getRepository(Budget);
      const reimbursementRepo = manager.getRepository(Reimbursement);

      const expenseDate = this.dateUtil.parseExpenseDate(dto.date);

      /* =====================
         USER
         ===================== */
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      /* =====================
         FILE UPLOAD
         ===================== */
      let proof: string | undefined;
      if (file) {
        const uploaded = await this.mediaService.uploadFile(
          file.buffer,
          file.originalname,
          '/expenses',
        );
        proof = uploaded.url;
      }

      /* =====================
         FETCH BUDGETS (FIFO)
         ===================== */
      const budgets = await budgetRepo.find({
        where: { user: { id: userId } },
        order: { createdAt: 'ASC' },
      });

      const totalAvailable = budgets.reduce(
        (sum, b) => sum + Number(b.remainingAmount),
        0,
      );

      let fromAllocation = 0;
      let fromReimbursement = 0;

      if (totalAvailable >= dto.amount) {
        fromAllocation = dto.amount;
      } else if (totalAvailable > 0) {
        fromAllocation = totalAvailable;
        fromReimbursement = dto.amount - totalAvailable;
      } else {
        fromReimbursement = dto.amount;
      }

      /* =====================
         REIMBURSEMENT
         ===================== */
      let reimbursement: Reimbursement | undefined;

      if (fromReimbursement > 0) {
        const existing = await reimbursementRepo.findOne({
          where: {
            requestedBy: { id: userId },
            isReimbursed: false,
          },
        });

        if (existing) {
          existing.amount = Number(existing.amount) + fromReimbursement;
          reimbursement = await reimbursementRepo.save(existing);
        } else {
          reimbursement = await reimbursementRepo.save(
            reimbursementRepo.create({
              requestedBy: user,
              amount: fromReimbursement,
              isReimbursed: false,
            }),
          );
        }
      }

      /* =====================
         APPLY BUDGET USAGE ✅ FIXED
         ===================== */
      let remaining = fromAllocation;

      for (const budget of budgets) {
        if (remaining <= 0) break;

        const available = Number(budget.remainingAmount);
        const usable = Math.min(remaining, available);

        if (usable > 0) {
          const newSpent = Number(budget.spentAmount) + usable;

          budget.spentAmount = newSpent;
          budget.remainingAmount = Math.max(
            Number(budget.allocatedAmount) - newSpent,
            0,
          );

          remaining -= usable;
          await budgetRepo.save(budget);
        }
      }

      /* =====================
         DEPARTMENT
         ===================== */
      const department = await this.departmentRepo.findOneBy({
        id: dto.department,
      });
      if (!department) throw new NotFoundException('Department not found');

      let subDepartment;
      if (dto.subDepartment) {
        subDepartment = await this.subDepartmentRepo.findOneBy({
          id: dto.subDepartment,
        });
        if (!subDepartment)
          throw new NotFoundException('SubDepartment not found');
      }

      /* =====================
         CREATE EXPENSE
         ===================== */
      const expense = expenseRepo.create({
        amount: dto.amount,
        description: dto.description,
        department,
        subDepartment,
        user,
        proof,
        paymentMode: dto.paymentMode,
        vendor: dto.vendor,
        date: expenseDate,
        fromAllocation,
        fromReimbursement,
        reimbursement,
      });

      await expenseRepo.save(expense);

      /* =====================
         USER FINANCIALS ✅ FINAL & CORRECT
         ===================== */
      user.spentAmount = Number(user.spentAmount) + fromAllocation;
      user.reimbursedAmount =
        Number(user.reimbursedAmount) + fromReimbursement;
      user.budgetLeft = Number(user.budgetLeft) - fromAllocation;

      await userRepo.save(user);

      /* =====================
         NOTIFICATIONS + CACHE
         ===================== */
      await this.sendExpenseEmailNotifications(
        expense,
        user,
        department,
        subDepartment,
      );

      const superAdmins = await userRepo.find({
        where: { role: UserRole.SUPERADMIN },
      });

      for (const admin of superAdmins) {
        this.notificationService.sendNotification(
          admin.id,
          `New expense created by ${user.name} for ₹${dto.amount}`,
          'EXPENSE_CREATED',
        );
      }

      await Promise.all([
        this.cacheManager.del(`expenses:all:1:20`),
        this.cacheManager.del(`expenses:user:${userId}:1:20`),
        this.cacheManager.del(`expenses:search:*`),
        this.cacheManager.del(`budgets:*`),
      ]);

      return {
        message: 'Created the new Expense successfully',
        expense,
      };
    });
  }


  /* =====================================================
     GET ALL EXPENSES
     ===================================================== */
  async getAllExpenses(
    page = 1,
    limit = 10,
    location: string = 'OVERALL',
  ) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const qb = this.expenseRepo
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.user', 'user')
      .leftJoinAndSelect('expense.department', 'department')
      .leftJoinAndSelect('expense.subDepartment', 'subDepartment')
      .leftJoinAndSelect('expense.reimbursement', 'reimbursement')
      .orderBy('expense.createdAt', 'DESC')
      .skip(skip)
      .take(safeLimit);

    /* =====================
       LOCATION FILTER
       ===================== */
    if (location && location !== 'OVERALL') {
      qb.andWhere('user.userLoc = :location', { location });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      message: 'Fetched expenses successfully',
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        location,
      },
      data,
    };
  }


  /* =====================================================
     GET EXPENSE BY ID
     ===================================================== */
  async getExpenseById(id: string) {
    const expense = await this.expenseRepo.findOne({
      where: { id },
      relations: ['user', 'department', 'subDepartment', 'reimbursement'],
    });

    if (!expense) throw new NotFoundException('Expense not found');

    return { message: 'Expense returned successfully', expense };
  }

  /* =====================================================
     UPDATE REIMBURSEMENT / EXPENSE
     ===================================================== */
  async updateReimbursement(dto: UpdateExpenseDto, id: string) {
    const expense = await this.expenseRepo.findOne({
      where: { id },
      relations: ['department', 'subDepartment'],
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    /* =====================
       RESOLVE DEPARTMENT
       ===================== */
    let department: Department | undefined;
    if (dto.department) {
      const foundDept = await this.departmentRepo.findOneBy({
        id: dto.department,
      });
      if (!foundDept) {
        throw new NotFoundException('Department not found');
      }
      department = foundDept;
    }

    /* =====================
       RESOLVE SUB-DEPARTMENT
       ===================== */
    let subDepartment: SubDepartment | undefined;
    if (dto.subDepartment) {
      const foundSubDept = await this.subDepartmentRepo.findOneBy({
        id: dto.subDepartment,
      });
      if (!foundSubDept) {
        throw new NotFoundException('SubDepartment not found');
      }
      subDepartment = foundSubDept;
    }

    /* =====================
       MERGE SAFE FIELDS ONLY
       ===================== */
    this.expenseRepo.merge(expense, {
      description: dto.description,
      amount: dto.amount,
      paymentMode: dto.paymentMode,
      vendor: dto.vendor,
      department,
      subDepartment,
    });

    await this.expenseRepo.save(expense);

    /* =====================
       CACHE INVALIDATION
       ===================== */
    await Promise.all([
      this.cacheManager.del(`expenses:${id}`),
      this.cacheManager.del('expenses:all:1:20'),
    ]);

    return {
      message: 'Expense updated successfully',
      expense,
    };
  }


  /* =====================================================
     EMAIL NOTIFICATIONS
     ===================================================== */
  private async sendExpenseEmailNotifications(
    expense: Expense,
    user: User,
    department: Department,
    subDepartment?: SubDepartment,
  ) {
    const admins = await this.userRepo.find({
      where: { role: UserRole.SUPERADMIN },
      select: ['email', 'name'],
    });

    const emails = admins
      .map((a) => a.email)
      .filter((e): e is string => !!e);

    if (!emails.length) return;

    const html = createExpenseEmailTemplate(
      expense,
      user,
      department,
      subDepartment,
    );

    await this.mailService.sendEmail({
      to: emails,
      subject: `💰 New Expense Submitted - ₹${expense.amount}`,
      html,
    });
  }

  async getAllExpensesForUser(
    page = 1,
    limit = 10,
    userId: string,
  ) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const cacheKey = `expenses:user:${userId}:${safePage}:${safeLimit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return {
        message: "Fetched user's expenses from cache",
        ...(cached as any),
      };
    }

    const [data, total] = await this.expenseRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ['user', 'department', 'subDepartment', 'reimbursement'],
      order: { createdAt: 'DESC' },
      skip,
      take: safeLimit,
    });

    const allExpenses = await this.expenseRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'department', 'subDepartment', 'reimbursement'],
      order: { createdAt: 'DESC' },
    });

    const stats = {
      totalSpent: allExpenses.reduce((s, e) => s + Number(e.amount), 0),
      totalFromAllocation: allExpenses.reduce(
        (s, e) => s + Number(e.fromAllocation || 0),
        0,
      ),
      totalFromReimbursement: allExpenses.reduce(
        (s, e) => s + Number(e.fromReimbursement || 0),
        0,
      ),
    };

    const result = {
      message: "Fetched user's expenses successfully",
      meta: { total, page: safePage, limit: safeLimit },
      stats,
      data,
      allExpenses,
    };

    await this.cacheManager.set(cacheKey, result, 60_000);
    return result;
  }
  async getAdminExpenses(page = 1, limit = 20) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await this.adminExpenseRepo.findAndCount({
      relations: ['department', 'subDepartment'],
      order: { createdAt: 'DESC' },
      skip,
      take: safeLimit,
    });

    const statsAgg = await this.adminExpenseRepo
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'totalSpent')
      .getRawOne();

    return {
      message: 'Fetched admin expenses successfully',
      data,
      stats: {
        totalSpent: Number(statsAgg?.totalSpent || 0),
      },
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
      },
    };
  }
  async getAdminExpenseById(id: string) {
    const expense = await this.adminExpenseRepo.findOne({
      where: { id },
      relations: ['department', 'subDepartment'],
    });

    if (!expense) {
      throw new NotFoundException('Admin expense not found');
    }

    return {
      message: 'Fetched admin expense successfully',
      expense,
    };
  }
  async searchExpenses(dto: SearchExpensesDto) {
    const {
      userName,
      minAmount,
      maxAmount,
      department,
      subDepartment,
      isReimbursed,
      month,
      year,
      location,
      page = 1,
      limit = 20,
    } = dto;

    const skip = (page - 1) * limit;

    const qb = this.expenseRepo
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.user', 'user')
      .leftJoinAndSelect('expense.department', 'department')
      .leftJoinAndSelect('expense.subDepartment', 'subDepartment')
      .leftJoinAndSelect('expense.reimbursement', 'reimbursement')
      .orderBy('expense.date', 'DESC');

    // TEXT
    if (userName) {
      qb.andWhere('LOWER(user.name) LIKE :userName', {
        userName: `%${userName.toLowerCase()}%`,
      });
    }

    // AMOUNT
    if (minAmount !== undefined) {
      qb.andWhere('expense.amount >= :minAmount', { minAmount });
    }
    if (maxAmount !== undefined) {
      qb.andWhere('expense.amount <= :maxAmount', { maxAmount });
    }

    if (department) {
      qb.andWhere('expense.departmentId = :departmentId', {
        departmentId: department,
      });
    }

    if (subDepartment) {
      qb.andWhere('expense.subDepartmentId = :subDepartmentId', {
        subDepartmentId: subDepartment,
      });
    }


    // REIMBURSEMENT
    if (isReimbursed !== undefined) {
      if (isReimbursed) {
        qb.andWhere('reimbursement.isReimbursed = true');
      } else {
        qb.andWhere(
          '(reimbursement.id IS NULL OR reimbursement.isReimbursed = false)',
        );
      }
    }

    // DATE
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      qb.andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // LOCATION (ENABLE AFTER VERIFYING DATA)
    if (location && location !== 'OVERALL') {
      qb.andWhere('user.userLoc = :location', { location });
    }

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const statsRaw = await qb
      .clone()
      .select([
        'SUM(expense.amount) as totalSpent',
        'SUM(expense.fromAllocation) as totalFromAllocation',
        'SUM(expense.fromReimbursement) as totalFromReimbursement',
      ])
      .getRawOne();

    return {
      message: 'Search completed successfully',
      meta: { total, page, limit },
      stats: {
        totalSpent: Number(statsRaw?.totalSpent || 0),
        totalFromAllocation: Number(statsRaw?.totalFromAllocation || 0),
        totalFromReimbursement: Number(statsRaw?.totalFromReimbursement || 0),
      },
      location: location || 'OVERALL',
      data,
    };
  }



}
