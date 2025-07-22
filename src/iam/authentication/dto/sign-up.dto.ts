import { IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../../users/enums/role.enum';

export class SignUpDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role;
}
