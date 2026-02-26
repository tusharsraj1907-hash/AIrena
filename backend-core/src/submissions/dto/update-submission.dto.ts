import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}

