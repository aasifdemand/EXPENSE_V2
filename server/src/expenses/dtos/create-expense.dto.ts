import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from 'src/enums/expense.enum';
import { PartialType } from '@nestjs/mapped-types';

export class CreateExpenseDto {
  /* =====================
     COMMON FIELDS
     ===================== */

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;

  @IsEnum(ExpenseType)
  expenseType: ExpenseType;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsUUID()
  department: string;

  @IsOptional()
  @IsUUID()
  subDepartment?: string;

  @IsOptional()
  @IsString()
  paymentMode?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  /* =====================
     USER EXPENSE ONLY
     ===================== */

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isReimbursed?: boolean;
}


export class UpdateExpenseDto extends PartialType(CreateExpenseDto) { }
