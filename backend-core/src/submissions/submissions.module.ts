import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [HttpModule, NotificationsModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule { }

