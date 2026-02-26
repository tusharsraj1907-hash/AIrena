import { Module } from '@nestjs/common';
import { HackathonsService } from './hackathons.service';
import { HackathonsController } from './hackathons.controller';
import { ParticipantReminderService } from './participant-reminder.service';
import { DeadlineReminderService } from './deadline-reminder.service';
import { EmailService } from '../utils/emailService';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PaymentsModule, NotificationsModule],
  controllers: [HackathonsController],
  providers: [
    HackathonsService,
    ParticipantReminderService,
    DeadlineReminderService,
    EmailService
  ],
  exports: [HackathonsService, EmailService],
})
export class HackathonsModule { }

