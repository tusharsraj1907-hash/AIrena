import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DeadlineReminderService {
  private readonly logger = new Logger(DeadlineReminderService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Run every day at 9:00 AM
  @Cron('0 9 * * *', {
    name: 'deadline-reminders',
    timeZone: 'Asia/Kolkata', // Adjust to your timezone
  })
  async sendDeadlineReminders() {
    this.logger.log('🔔 Starting daily deadline reminder check...');

    try {
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);

      // Find hackathons with submission deadlines in the next 7 days
      const upcomingHackathons = await this.prisma.hackathon.findMany({
        where: {
          submissionDeadline: {
            gte: now,
            lte: sevenDaysFromNow,
          },
          status: {
            in: ['UPCOMING', 'LIVE'],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`📊 Found ${upcomingHackathons.length} hackathons with upcoming deadlines`);

      for (const hackathon of upcomingHackathons) {
        const daysLeft = Math.ceil(
          (new Date(hackathon.submissionDeadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send reminders for 1, 3, and 7 days before deadline
        if (![1, 3, 7].includes(daysLeft)) {
          continue;
        }

        this.logger.log(`⏰ Processing reminders for "${hackathon.title}" (${daysLeft} days left)`);

        for (const participant of hackathon.participants) {
          try {
            // Check if participant has already submitted
            const submission = await this.prisma.submission.findFirst({
              where: {
                hackathonId: hackathon.id,
                participantId: participant.id,
                status: {
                  not: 'DRAFT',
                },
              },
            });

            // Only send reminder if they haven't submitted yet
            if (!submission) {
              await this.notificationsService.notifyParticipantDeadlineReminder(
                participant.user.id,
                hackathon.id,
                hackathon.title,
                daysLeft
              );

              this.logger.log(
                `✅ Sent reminder to ${participant.user.firstName} ${participant.user.lastName} for ${hackathon.title}`
              );
            }
          } catch (error) {
            this.logger.error(
              `❌ Failed to send reminder to participant ${participant.user.id}:`,
              error
            );
          }
        }
      }

      this.logger.log('✅ Deadline reminder check completed');
    } catch (error) {
      this.logger.error('❌ Error in deadline reminder service:', error);
    }
  }

  // Manual trigger for testing (can be called via API endpoint)
  async triggerManualCheck() {
    this.logger.log('🔧 Manual deadline reminder check triggered');
    await this.sendDeadlineReminders();
  }
}
