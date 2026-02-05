import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserDepartment, UserLocation } from 'src/enums/user.enum';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(UserDepartment)
    department?: UserDepartment = UserDepartment.GENERAL;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole = UserRole.USER;

    @IsOptional()
    @IsEnum(UserLocation)
    userLoc?: UserLocation = UserLocation.OVERALL;
}
