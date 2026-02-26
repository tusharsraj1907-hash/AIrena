import { PartialType } from '@nestjs/mapped-types';
import { CreateHackathonDto } from './create-hackathon.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { HackathonStatus } from '../../common/constants/enums';

export class UpdateHackathonDto extends PartialType(CreateHackathonDto) {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(HackathonStatus))
  status?: string;
}

