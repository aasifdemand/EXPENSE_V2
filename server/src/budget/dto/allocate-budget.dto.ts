

import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsString, IsOptional, IsUUID } from "class-validator";


export class AllocateBudgetDto {


    @IsUUID()
    userId: string;

    @IsNumber()
    amount: number;



    @IsString()
    @IsOptional()
    company?: string
}


export class UpdateAllocatedBudgetDto extends PartialType(AllocateBudgetDto) { }
