import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HackathonsService } from './hackathons.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, HackathonStatus } from '../common/constants/enums';

@Controller('hackathons')
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ORGANIZER, UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() createDto: CreateHackathonDto) {
    return this.hackathonsService.create(user.id, createDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.hackathonsService.findAll({ status, category, search });
  }

  @Get('my-hackathons')
  @UseGuards(JwtAuthGuard)
  async getMyHackathons(@CurrentUser() user: any) {
    console.log('🔍 Getting my hackathons for user:', user.id);
    const result = await this.hackathonsService.getMyHackathons(user.id);
    console.log('📋 My hackathons result:', { count: result.length });
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hackathonsService.findOne(id);
  }

  @Get(':id/participants')
  // Public endpoint to allow viewing participant count
  async getParticipants(@Param('id') id: string) {
    console.log('🔍 Getting participants for hackathon:', id);
    const result = await this.hackathonsService.getParticipants(id);
    console.log('📋 Participants result:', { count: result.length, participants: result.map(p => ({ email: p.user.email, userId: p.user.id })) });
    return result;
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async registerForHackathon(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() registrationData?: {
      teamName?: string;
      teamDescription?: string;
      selectedTrack?: number;
      teamMembers?: Array<{ name: string; email: string; role: string }>;
      paymentId?: string;
      providerPaymentId?: string;
    },
  ) {
    console.log('🔄 Registration request:', { hackathonId: id, userId: user.id, registrationData });
    const result = await this.hackathonsService.registerForHackathon(user.id, id, registrationData);
    console.log('✅ Registration result:', result);
    return result;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ORGANIZER, UserRole.ADMIN)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateHackathonDto,
  ) {
    return this.hackathonsService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ORGANIZER, UserRole.ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.hackathonsService.remove(user.id, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ORGANIZER, UserRole.ADMIN)
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.hackathonsService.updateStatus(user.id, id, status);
  }
}

