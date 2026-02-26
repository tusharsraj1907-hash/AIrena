import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../utils/emailService';
import {
  newHackathonEmail,
  participantRegistrationEmail,
  deadlineReminderEmail,
  hostNewParticipantEmail,
  hostNewSubmissionEmail,
} from '../utils/emailTemplates';

@Injectable()
export class NotificationsService {
  private emailService: EmailService;

  constructor(private prisma: PrismaService) {
    this.emailService = new EmailService(this.prisma);
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    hackathonId?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        hackathonId: data.hackathonId,
        isRead: false,
      },
    });
  }

  async findAll(userId?: string) {
    return this.prisma.notification.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async remove(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // Helper methods for common notification types
  
  // HOST NOTIFICATIONS
  async notifyHostParticipantRegistered(hostId: string, hackathonId: string, hackathonTitle: string, participantName: string) {
    // Create in-app notification
    const notification = await this.createNotification({
      userId: hostId,
      type: 'PARTICIPANT_REGISTERED',
      title: 'New Participant Registered',
      message: `${participantName} has registered for ${hackathonTitle}`,
      hackathonId,
    });

    // Send email notification
    try {
      const host = await this.prisma.user.findUnique({ where: { id: hostId } });
      const participant = await this.prisma.user.findFirst({
        where: { 
          OR: [
            { firstName: { contains: participantName.split(' ')[0] } },
            { lastName: { contains: participantName.split(' ')[1] || '' } }
          ]
        }
      });

      if (host && participant) {
        const emailTemplate = hostNewParticipantEmail(
          `${host.firstName} ${host.lastName}`,
          hackathonTitle,
          participantName,
          participant.email
        );
        await this.emailService.sendEmailWithLogging(host.email, emailTemplate.subject, emailTemplate.html);
      }
    } catch (error) {
      console.error('Failed to send host notification email:', error);
    }

    return notification;
  }

  async notifyHostSubmissionCreated(hostId: string, hackathonId: string, hackathonTitle: string, participantName: string) {
    // Create in-app notification
    const notification = await this.createNotification({
      userId: hostId,
      type: 'SUBMISSION_CREATED',
      title: 'New Submission',
      message: `${participantName} has submitted a project for ${hackathonTitle}`,
      hackathonId,
    });

    // Send email notification
    try {
      const host = await this.prisma.user.findUnique({ where: { id: hostId } });
      if (host) {
        const emailTemplate = hostNewSubmissionEmail(
          `${host.firstName} ${host.lastName}`,
          hackathonTitle,
          participantName,
          'their project' // We don't have project title here, could be improved
        );
        await this.emailService.sendEmailWithLogging(host.email, emailTemplate.subject, emailTemplate.html);
      }
    } catch (error) {
      console.error('Failed to send host submission email:', error);
    }

    return notification;
  }

  async notifyHostSubmissionUpdated(hostId: string, hackathonId: string, hackathonTitle: string, participantName: string) {
    return this.createNotification({
      userId: hostId,
      type: 'SUBMISSION_UPDATED',
      title: 'Submission Updated',
      message: `${participantName} has updated their submission for ${hackathonTitle}`,
      hackathonId,
    });
  }

  // PARTICIPANT NOTIFICATIONS
  async notifyParticipantNewHackathon(participantId: string, hackathonId: string, hackathonTitle: string, organizerName: string) {
    // Create in-app notification
    const notification = await this.createNotification({
      userId: participantId,
      type: 'NEW_HACKATHON',
      title: 'New Hackathon Available',
      message: `${organizerName} has created a new hackathon: ${hackathonTitle}`,
      hackathonId,
    });

    // Send email notification
    try {
      const participant = await this.prisma.user.findUnique({ where: { id: participantId } });
      const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
      
      if (participant && hackathon) {
        const emailTemplate = newHackathonEmail(
          `${participant.firstName} ${participant.lastName}`,
          hackathonTitle,
          organizerName,
          new Date(hackathon.startDate).toLocaleDateString(),
          new Date(hackathon.endDate).toLocaleDateString()
        );
        await this.emailService.sendEmailWithLogging(participant.email, emailTemplate.subject, emailTemplate.html);
      }
    } catch (error) {
      console.error('Failed to send new hackathon email:', error);
    }

    return notification;
  }

  async notifyParticipantRegistrationSuccess(participantId: string, hackathonId: string, hackathonTitle: string) {
    // Create in-app notification
    const notification = await this.createNotification({
      userId: participantId,
      type: 'REGISTRATION_SUCCESS',
      title: 'Registration Successful',
      message: `You have successfully registered for ${hackathonTitle}`,
      hackathonId,
    });

    // Send email notification
    try {
      const participant = await this.prisma.user.findUnique({ where: { id: participantId } });
      const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
      
      if (participant && hackathon) {
        const emailTemplate = participantRegistrationEmail(
          `${participant.firstName} ${participant.lastName}`,
          hackathonTitle,
          new Date(hackathon.startDate).toLocaleDateString(),
          hackathon.submissionDeadline ? new Date(hackathon.submissionDeadline).toLocaleDateString() : 'TBD'
        );
        await this.emailService.sendEmailWithLogging(participant.email, emailTemplate.subject, emailTemplate.html);
      }
    } catch (error) {
      console.error('Failed to send registration email:', error);
    }

    return notification;
  }

  async notifyParticipantSubmissionSuccess(participantId: string, hackathonId: string, hackathonTitle: string) {
    return this.createNotification({
      userId: participantId,
      type: 'SUBMISSION_SUCCESS',
      title: 'Submission Successful',
      message: `Your project has been submitted for ${hackathonTitle}`,
      hackathonId,
    });
  }

  async notifyParticipantDeadlineReminder(participantId: string, hackathonId: string, hackathonTitle: string, daysLeft: number) {
    // Create in-app notification
    const notification = await this.createNotification({
      userId: participantId,
      type: 'DEADLINE_REMINDER',
      title: 'Submission Deadline Approaching',
      message: `Only ${daysLeft} day(s) left to submit your project for ${hackathonTitle}`,
      hackathonId,
    });

    // Send email notification
    try {
      const participant = await this.prisma.user.findUnique({ where: { id: participantId } });
      const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
      
      if (participant && hackathon && hackathon.submissionDeadline) {
        const emailTemplate = deadlineReminderEmail(
          `${participant.firstName} ${participant.lastName}`,
          hackathonTitle,
          daysLeft,
          new Date(hackathon.submissionDeadline).toLocaleDateString()
        );
        await this.emailService.sendEmailWithLogging(participant.email, emailTemplate.subject, emailTemplate.html);
      }
    } catch (error) {
      console.error('Failed to send deadline reminder email:', error);
    }

    return notification;
  }

  // Notify all participants about new hackathon
  async notifyAllParticipantsNewHackathon(hackathonId: string, hackathonTitle: string, organizerName: string) {
    const participants = await this.prisma.user.findMany({
      where: { role: 'PARTICIPANT' },
      select: { id: true },
    });

    const notifications = participants.map(p =>
      this.notifyParticipantNewHackathon(p.id, hackathonId, hackathonTitle, organizerName)
    );

    return Promise.all(notifications);
  }
}