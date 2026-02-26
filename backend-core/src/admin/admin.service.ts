import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../utils/emailService';
import { hostApprovalEmail, hostRejectionEmail } from '../utils/emailTemplates';

@Injectable()
export class AdminService {
  private emailService: EmailService;

  constructor(private prisma: PrismaService) {
    this.emailService = new EmailService(this.prisma);
  }

  async getHostRequests() {
    const hostRequests = await this.prisma.user.findMany({
      where: {
        role: 'HOST',
        hostApproved: false,
        hostRequestedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        hostRequestedAt: true,
        hostApproved: true,
        createdAt: true,
      },
      orderBy: {
        hostRequestedAt: 'desc',
      },
    });

    return hostRequests.map(request => ({
      id: request.id,
      name: `${request.firstName} ${request.lastName}`,
      email: request.email,
      requestedAt: request.hostRequestedAt,
      status: 'pending',
      createdAt: request.createdAt,
    }));
  }

  async approveHost(userId: string) {
    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'HOST') {
      throw new ForbiddenException('User is not a host');
    }

    if (user.hostApproved) {
      throw new ForbiddenException('Host is already approved');
    }

    // Update user to approved but keep email unverified until OTP
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        hostApproved: true,
        hostApprovedAt: new Date(),
        // Keep emailVerified false - will be set to true after OTP verification
      },
    });

    // Send OTP for email verification after approval
    try {
      const otpService = new (require('../utils/otpService').OtpService)(this.prisma, this.emailService);
      await otpService.sendOtp(updatedUser.id);
      console.log(`✅ OTP sent to approved host: ${updatedUser.email}`);
    } catch (error) {
      console.error('Failed to send OTP to approved host:', error);
    }

    // Send approval email
    try {
      const hostName = `${updatedUser.firstName} ${updatedUser.lastName}`;
      const approvedAt = updatedUser.hostApprovedAt?.toLocaleString() || new Date().toLocaleString();
      const emailTemplate = hostApprovalEmail(hostName, approvedAt);

      await this.emailService.sendEmailWithLogging(
        updatedUser.email,
        emailTemplate.subject,
        emailTemplate.html
      );

      console.log(`✅ Host approval email sent to: ${updatedUser.email}`);
    } catch (error) {
      console.error('Failed to send host approval email:', error);
      // Don't fail the approval if email fails
    }

    return {
      id: updatedUser.id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      hostApproved: updatedUser.hostApproved,
      hostApprovedAt: updatedUser.hostApprovedAt,
    };
  }

  async rejectHost(userId: string) {
    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'HOST') {
      throw new ForbiddenException('User is not a host');
    }

    if (user.hostApproved) {
      throw new ForbiddenException('Host is already approved');
    }

    // Send rejection email
    try {
      const hostName = `${user.firstName} ${user.lastName}`;
      const rejectedAt = new Date().toLocaleString();
      const emailTemplate = hostRejectionEmail(hostName, rejectedAt);

      await this.emailService.sendEmailWithLogging(
        user.email,
        emailTemplate.subject,
        emailTemplate.html
      );

      console.log(`✅ Host rejection email sent to: ${user.email}`);
    } catch (error) {
      console.error('Failed to send host rejection email:', error);
      // Continue with rejection even if email fails
    }

    // Delete the user (they can re-register later)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'Host request rejected and user removed',
      rejectedUser: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    };
  }

  async getAllHosts() {
    // Get all users who have created hackathons (organizers)
    // This includes users with role 'HOST' or any user who has organized hackathons
    const hosts = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: 'HOST' },
          { organizedHackathons: { some: {} } }, // Users who have created at least one hackathon
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        organizationName: true,
        hostOnboarded: true,
        role: true,
        createdAt: true,
        organizedHackathons: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            submissionDeadline: true,
          },
        },
        _count: {
          select: { organizedHackathons: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return hosts.map(host => ({
      id: host.id,
      name: `${host.firstName} ${host.lastName}`,
      email: host.email,
      phoneNumber: host.phoneNumber || 'N/A',
      organizationName: host.organizationName || 'N/A',
      role: host.role,
      hackathonsCreated: host._count.organizedHackathons,
      hackathons: host.organizedHackathons,
      joinedAt: host.createdAt,
      onboarded: host.hostOnboarded,
    }));
  }


  async getAllParticipants() {
    const participants = await this.prisma.user.findMany({
      where: {
        role: 'PARTICIPANT',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        participations: {
          include: {
            hackathon: {
              select: {
                title: true,
                startDate: true,
                endDate: true,
                submissionDeadline: true,
              },
            },
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { participations: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(participants.map(async (p) => {
      const participationsWithStatus = await Promise.all(p.participations.map(async (part) => {
        const submission = await this.prisma.submission.findFirst({
          where: {
            hackathonId: part.hackathonId,
            OR: [
              { participantId: part.id },
              { teamId: part.teamId },
            ],
          },
          select: { status: true },
        });

        // Find participant's payment for this hackathon
        const payment = await this.prisma.payment.findFirst({
          where: {
            hostId: p.id,
            hackathonId: part.hackathonId,
          },
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            invoiceId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        return {
          ...part,
          submissionStatus: submission?.status || 'Not Submitted',
          registrationDate: part.registeredAt,
          selectedTrack: part.selectedTrack || 'N/A',
          teamRole: part.role,
          payment,
        };
      }));

      return {
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
        phoneNumber: p.phoneNumber || 'N/A',
        hackathonsJoined: p._count.participations,
        joinedAt: p.createdAt,
        participations: participationsWithStatus.map(part => ({
          hackathonName: part.hackathon.title,
          hackathonStartDate: part.hackathon.startDate,
          hackathonEndDate: part.hackathon.endDate,
          submissionDeadline: part.hackathon.submissionDeadline,
          teamName: part.team?.name || 'Individual',
          teamRole: part.teamRole,
          teamMembers: part.team?.members.map(m => `${m.user.firstName} ${m.user.lastName} (${m.user.email})`).join(', ') || 'N/A',
          submissionStatus: part.submissionStatus,
          registrationDate: part.registrationDate,
          selectedTrack: part.selectedTrack,
          // Payment fields
          paymentId: part.payment?.id || 'N/A',
          paymentAmount: part.payment?.amount ?? 0,
          paymentStatus: part.payment?.status || 'N/A',
          paymentMethod: part.payment?.paymentMethod || 'N/A',
          paymentDate: part.payment?.createdAt || null,
          paymentInvoiceId: part.payment?.invoiceId || 'N/A',
        })),
      };
    }));
  }

  // System Configuration Methods
  async getSystemConfig(key: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });

    return config || { key, value: null };
  }

  async updateSystemConfig(key: string, value: string, description?: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: {
        value,
        description,
      },
      create: {
        key,
        value,
        description,
      },
    });
  }

  async deleteUser(userId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Protect Admin users from deletion
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot delete admin users');
    }

    // Delete the user
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully', userId };
  }
}