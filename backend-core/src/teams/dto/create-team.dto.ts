import { IsString, IsOptional, IsArray, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TeamMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  hackathonId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  members: TeamMemberDto[];
}
