import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { SearchExpensesDto } from './dtos/search-expense.dto';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import * as fs from 'fs';
@Controller('expenses')
export class ExpensesController {
  private logger = new Logger('ExpensesController');

  constructor(private readonly expensesService: ExpensesService) { }

  /* =====================================================
     CREATE EXPENSE
     ===================================================== */
  @Post('create')
  @UseGuards(CsrfGuard)
  @UseInterceptors(
    FileInterceptor('proof', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const rawUsername =
            req.headers['x-username']?.toString() || 'unknown';

          // sanitize username (VERY important)
          const username = rawUsername
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_-]/g, '');

          const uploadPath = join(
            process.cwd(),
            'uploads',
            username,
            'expenses',
          );

          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async createExpense(
    @Req() req: Request,
    @Body() dto: CreateExpenseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log('Received create expense request');

    const { session } = req;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, please verify your identity first',
      );
    }

    return this.expensesService.handleCreateExpense(
      dto,
      session.user!.id!, // ✅ UUID
      file,
    );
  }

  /* =====================================================
     GET ALL EXPENSES
     ===================================================== */
  @Get()
  @UseGuards(CsrfGuard)
  async getExpenses(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('location') location = 'OVERALL',
    @Req() req: Request,
  ) {
    const { session } = req;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, please verify your identity first',
      );
    }

    return this.expensesService.getAllExpenses(
      Number(page),
      Number(limit),
      location,
    );
  }

  /* =====================================================
     SEARCH EXPENSES
     ===================================================== */
  @Get('search')
  @UseGuards(CsrfGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async searchExpenses(
    @Query() searchDto: SearchExpensesDto,
    @Req() req: Request,
  ) {
    const { session } = req;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, please verify your identity first',
      );
    }

    return this.expensesService.searchExpenses(searchDto);
  }

  /* =====================================================
     ADMIN EXPENSES (LIST)
     ===================================================== */
  @Get('admin')
  @UseGuards(CsrfGuard)
  async getAdminExpenses(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Req() req: Request,
  ) {
    const { session } = req;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated ||
      session.user?.role !== 'superadmin'
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.expensesService.getAdminExpenses(
      Number(page),
      Number(limit),
    );
  }

  /* =====================================================
     ADMIN EXPENSE (BY ID)
     ===================================================== */
  @Get('admin/:id')
  @UseGuards(CsrfGuard)
  async getAdminExpenseById(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { session } = req;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated ||
      session.user?.role !== 'superadmin'
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.expensesService.getAdminExpenseById(id);
  }

  /* =====================================================
     USER EXPENSES (BY USER ID)
     ===================================================== */
  @Get('user/:id')
  @UseGuards(CsrfGuard)
  async getExpensesForUser(
    @Param('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Req() req: Request,
  ) {
    const { session } = req;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, please verify your identity first',
      );
    }

    return this.expensesService.getAllExpensesForUser(
      Number(page),
      Number(limit),
      userId,
    );
  }

  /* =====================================================
     SINGLE EXPENSE
     ===================================================== */
  @Get(':id')
  @UseGuards(CsrfGuard)
  async getExpenseById(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { session } = req;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, please verify your identity first',
      );
    }

    return this.expensesService.getExpenseById(id);
  }

  /* =====================================================
     UPDATE EXPENSE / REIMBURSEMENT
     ===================================================== */
  @Patch(':id')
  @UseGuards(CsrfGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async updateExpense(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req: Request,
  ) {
    const { session } = req;

    if (
      session?.twoFactorPending ||
      !session?.twoFactorVerified ||
      !session?.authenticated
    ) {
      throw new UnauthorizedException(
        'Unauthorized, please verify your identity first',
      );
    }

    return this.expensesService.updateReimbursement(dto, id);
  }
}
