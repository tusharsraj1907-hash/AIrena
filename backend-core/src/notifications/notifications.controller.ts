import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@CurrentUser() user: any) {
    return this.notificationsService.findAll(user.id);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post(':id/delete')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}

