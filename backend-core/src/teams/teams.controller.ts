import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: any, @Body() createTeamDto: CreateTeamDto) {
    console.log('🔄 Creating team:', { leaderId: user.id, teamName: createTeamDto.name });
    const result = await this.teamsService.create(user.id, createTeamDto);
    console.log('✅ Team created:', result);
    return result;
  }

  @Get('hackathon/:hackathonId')
  @UseGuards(JwtAuthGuard)
  async findByHackathon(@Param('hackathonId') hackathonId: string) {
    console.log('🔍 Getting teams for hackathon:', hackathonId);
    const teams = await this.teamsService.findByHackathon(hackathonId);
    console.log('📋 Teams found:', teams.length);
    return teams;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    console.log('🔍 Getting team:', id);
    const team = await this.teamsService.findOne(id);
    return team;
  }
}
