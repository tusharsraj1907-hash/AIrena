import { IsString, IsOptional, IsIn, IsBoolean } from 'class-validator';
import { UserRole } from '../../common/constants/enums';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(UserRole))
  role?: string;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsBoolean()
  hostOnboarded?: boolean;

  @IsOptional()
  @IsString()
  bio?: string;
}

