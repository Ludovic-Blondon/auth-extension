import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Role } from '../../../users/enums/role.enum';
import {
  Permission,
  PermissionType,
} from '../../authorization/permission.type';

export class SignUpDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions: PermissionType[];
}
