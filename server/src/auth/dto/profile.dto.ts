import { IsOptional, IsEnum, IsString, MinLength } from 'class-validator';
import {
    UserRole,
    UserDepartment,
    UserLocation,
} from 'src/enums/user.enum';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsEnum(UserDepartment)
    department?: UserDepartment;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsEnum(UserLocation)
    userLoc?: UserLocation;
}
