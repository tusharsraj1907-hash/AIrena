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
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
// Removed enum import - using string type instead

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() createDto: CreateSubmissionDto) {
    try {
      console.log('🔐 Submission creation request from user:', { id: user.id, email: user.email, role: user.role });
      console.log('📦 Submission DTO received:', {
        hackathonId: createDto.hackathonId,
        title: createDto.title,
        filesCount: createDto.files?.length || 0,
        isDraft: createDto.isDraft
      });
      
      const result = await this.submissionsService.create(user.id, createDto);
      
      console.log('✅ Submission created successfully:', {
        id: result.id,
        submitterId: result.submitter?.id,
        hackathonId: result.hackathonId
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ Submission creation failed:', {
        error: error.message,
        stack: error.stack,
        userId: user.id,
        userEmail: user.email,
        createDto: createDto
      });
      throw error; // Re-throw to let NestJS handle it properly
    }
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('hackathonId') hackathonId?: string,
    @Query('userId') userId?: string,
    @Query('teamId') teamId?: string,
    @Query('status') status?: string,
    @Query('isDraft') isDraft?: string,
  ) {
    return this.submissionsService.findAll({
      hackathonId,
      userId,
      teamId,
      status,
      isDraft: isDraft === 'true',
    }, user?.role, user?.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.submissionsService.findOne(id, user?.role, user?.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateSubmissionDto,
  ) {
    return this.submissionsService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.submissionsService.remove(user.id, id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; feedback?: string },
  ) {
    return this.submissionsService.updateStatus(user.id, id, body.status, body.feedback);
  }
}

