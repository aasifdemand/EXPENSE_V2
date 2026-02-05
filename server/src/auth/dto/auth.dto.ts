import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/enums/user.enum';

export class AuthDto {
  @ApiProperty({ example: 'john_doe', description: 'Username of the user' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password of the user',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: UserRole.USER,
    description: 'Role of the user',
    enum: UserRole,
  })
  @IsEnum(UserRole, {
    message: 'role must be a valid enum value: admin or user',
  })
  role: UserRole;
  deviceName: string;
}
