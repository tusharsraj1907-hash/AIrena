import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { UserRole } from '../../common/constants/enums';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(UserRole))
  role?: string;
}

