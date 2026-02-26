import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  hackathonId: string;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  techStack?: string;

  @IsUrl()
  @IsOptional()
  repositoryUrl?: string;

  @IsUrl()
  @IsOptional()
  liveUrl?: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsUrl()
  @IsOptional()
  presentationUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  files?: string[]; // S3 URLs

  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}

