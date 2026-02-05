import { Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsNumber,
    Min,
    IsEnum,
} from 'class-validator';

export enum Location {
    OVERALL = 'OVERALL',
    MUMBAI = 'MUMBAI',
    BENGALURU = 'BENGALURU',
}

export class SearchBudgetAllocationsDto {
    /* =====================
       FILTERS
       ===================== */

    @IsOptional()
    @IsString()
    userName?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    month?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    year?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minAllocated?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxAllocated?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minSpent?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxSpent?: number;

    @IsOptional()
    @IsEnum(Location)
    location?: Location;

    /* =====================
       PAGINATION
       ===================== */

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 10;
}
