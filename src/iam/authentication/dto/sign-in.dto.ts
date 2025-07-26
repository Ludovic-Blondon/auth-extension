import {
  IsEmail,
  IsOptional,
  IsNumberString,
  MinLength,
} from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsOptional()
  @IsNumberString()
  tfaCode?: string;
}
