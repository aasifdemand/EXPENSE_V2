import {
   IsString,
   IsNumber,
   IsBoolean,
   IsOptional,
   IsEnum,
   IsUUID,
   Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Location {
   OVERALL = 'OVERALL',
   MUMBAI = 'MUMBAI',
   BENGALURU = 'BENGALURU',
}

export class SearchExpensesDto {
   @IsOptional()
   @IsString()
   userName?: string;

   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   @Min(0)
   minAmount?: number;

   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   @Min(0)
   maxAmount?: number;

   @IsOptional()
   @IsUUID('4')
   department?: string;

   @IsOptional()
   @IsUUID('4')
   subDepartment?: string;


   @IsOptional()
   @Type(() => Boolean)
   @IsBoolean()
   isReimbursed?: boolean;

   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   month?: number;

   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   year?: number;

   @IsOptional()
   @IsEnum(Location)
   location?: Location;

   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   @Min(1)
   page: number = 1;

   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   @Min(1)
   limit: number = 20;
}

