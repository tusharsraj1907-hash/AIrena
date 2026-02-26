import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  IsIn,
  Min,
  Max,
  ValidateNested,
  IsArray,
  IsEmail,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HackathonCategory } from '../../common/constants/enums';

class RequirementsDto {
  @IsString()
  description: string;

  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];

  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @IsNumber()
  @IsOptional()
  minScore?: number;
}

class TimelinePhaseDto {
  @IsString()
  phase: string;

  @IsString()
  description: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

class JudgingCriterionDto {
  @IsString()
  criterion: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;
}

class JudgeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  bio: string;

  @IsString()
  expertise: string;

  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;
}

class ProblemStatementTrackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  trackNumber: number;

  @IsString()
  trackTitle: string;

  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsString()
  fileType: string;

  @IsNumber()
  fileSize: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateHackathonDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  whyParticipate?: string;

  @IsString()
  @IsIn(Object.values(HackathonCategory))
  category: string;

  @IsDateString()
  registrationStart: string;

  @IsDateString()
  registrationEnd: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  submissionDeadline: string;

  @IsNumber()
  @IsOptional()
  prizeAmount?: number;

  @IsString()
  @IsOptional()
  prizeCurrency?: string;

  @IsNumber()
  @Min(0)
  registrationFee: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minTeamSize?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxTeamSize?: number;

  @IsBoolean()
  @IsOptional()
  allowIndividual?: boolean;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsBoolean()
  @IsOptional()
  isVirtual?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelinePhaseDto)
  @IsOptional()
  timeline?: TimelinePhaseDto[];

  @IsString()
  @IsOptional()
  expectedOutcome?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JudgingCriterionDto)
  @IsOptional()
  judgingCriteria?: JudgingCriterionDto[];

  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ValidateNested()
  @Type(() => RequirementsDto)
  @IsOptional()
  requirements?: RequirementsDto;

  @IsString()
  @IsOptional()
  rules?: string;

  @IsString()
  @IsOptional()
  guidelines?: string;

  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @IsString()
  @IsOptional()
  logoImageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JudgeDto)
  @IsOptional()
  judges?: JudgeDto[];

  // Problem statement tracks (up to 5)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProblemStatementTrackDto)
  @IsOptional()
  problemStatementTracks?: ProblemStatementTrackDto[];

  // Legacy single problem statement (for backward compatibility)
  @IsString()
  @IsOptional()
  problemStatementUrl?: string;

  @IsString()
  paymentId: string;

  @IsString()
  providerPaymentId: string;
}

