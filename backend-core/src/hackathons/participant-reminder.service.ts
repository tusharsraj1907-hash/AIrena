import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../utils/emailService';
import * as emailTemplates from '../utils/emailTemplates';

@Injectable()
export class ParticipantReminderService {
    private readonly logger = new Logger(ParticipantReminderService.name);

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    // Run every hour to check for 1-hour and final-day reminders
    @Cron(CronExpression.EVERY_HOUR)
    async handleReminders() {
        this.logger.log('Checking for hackathon submission reminders...');

        // 1. Find all hackathons that are LIVE and have a submission deadline in the future
        const now = new Date();
        const liveHackathons = await this.prisma.hackathon.findMany({
            where: {
                status: 'LIVE',
                submissionDeadline: {
                    gt: now,
                },
            },
            include: {
                organizer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        for (const hackathon of liveHackathons) {
            if (!hackathon.submissionDeadline) continue;

            const deadline = new Date(hackathon.submissionDeadline);
            const diffMs = deadline.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            const diffDays = Math.ceil(diffHours / 24);

            // Determine reminder type
            let reminderType: 'DAILY' | 'FINAL_DAY' | 'ONE_HOUR' | null = null;

            if (diffHours <= 1.1) { // 1 hour remaining (buffer for cron offset)
                reminderType = 'ONE_HOUR';
            } else if (diffHours <= 24.1 && diffHours > 23) { // Close to 24 hours (final day)
                reminderType = 'FINAL_DAY';
            } else if (diffDays > 1 && diffDays <= 7) { // Daily for the last week
                // For daily reminders, we only send them once a day (e.g., at noon)
                // But since this cron runs hourly, we'll use tracking to ensure once per day per hackathon
                reminderType = 'DAILY';
            }

            if (reminderType) {
                await this.processReminders(hackathon, reminderType, diffDays);
            }
        }
    }

    private async processReminders(hackathon: any, type: 'DAILY' | 'FINAL_DAY' | 'ONE_HOUR', diffDays: number) {
        // 2. Find all participants for this hackathon
        const participants = await this.prisma.hackathonParticipant.findMany({
            where: {
                hackathonId: hackathon.id,
            },
            include: {
                user: true,
            },
        });

        for (const participant of participants) {
            // 3. Check if they have already submitted
            const hasSubmitted = await this.prisma.submission.findFirst({
                where: {
                    hackathonId: hackathon.id,
                    participantId: participant.id,
                    status: 'SUBMITTED',
                },
            });

            if (hasSubmitted) continue;

            // 4. Check if this specific reminder has already been sent
            // Using 'Notification' as a tracking table
            // title: REMINDER_{HACKATHON_ID}_{TYPE}_{DATE_PARTS}
            const today = new Date().toISOString().split('T')[0];
            const notificationTitle = `REMINDER_${hackathon.id}_${type}${type === 'DAILY' ? `_${today}` : ''}`;

            const existingNotification = await this.prisma.notification.findFirst({
                where: {
                    userId: participant.userId,
                    title: notificationTitle,
                },
            });

            if (existingNotification) continue;

            // 5. Send Email
            await this.sendEmail(participant.user, hackathon, type, diffDays);

            // 6. Track that we sent it
            await this.prisma.notification.create({
                data: {
                    userId: participant.userId,
                    title: notificationTitle,
                    message: `Submission reminder for ${hackathon.title}`,
                    type: 'INFO',
                    isRead: false,
                },
            });
        }
    }

    private async sendEmail(user: any, hackathon: any, type: 'DAILY' | 'FINAL_DAY' | 'ONE_HOUR', diffDays: number) {
        try {
            const userName = `${user.firstName} ${user.lastName}`;
            const organizerName = `${hackathon.organizer.firstName} ${hackathon.organizer.lastName}`;
            const deadlineStr = hackathon.submissionDeadline.toLocaleString();

            let emailTemplate;

            switch (type) {
                case 'DAILY':
                    emailTemplate = emailTemplates.dailyReminderEmail(userName, hackathon.title, organizerName, deadlineStr, diffDays);
                    break;
                case 'FINAL_DAY':
                    emailTemplate = emailTemplates.finalDayReminderEmail(userName, hackathon.title, deadlineStr);
                    break;
                case 'ONE_HOUR':
                    emailTemplate = emailTemplates.oneHourReminderEmail(userName, hackathon.title);
                    break;
            }

            if (emailTemplate) {
                await this.emailService.sendEmailWithLogging(user.email, emailTemplate.subject, emailTemplate.html);
                this.logger.log(`Sent ${type} reminder to ${user.email} for hackathon ${hackathon.id}`);
            }
        } catch (error) {
            this.logger.error(`Failed to send ${type} reminder to ${user.email}:`, error);
        }
    }
}
