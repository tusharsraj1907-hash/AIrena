import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { EmailService } from '../utils/emailService';
import { PaymentsService } from '../payments/payments.service';
import { paymentReceiptEmail } from '../utils/emailTemplates';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class HackathonsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
  ) { }

  private ensureAbsoluteUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // If it's already an absolute URL but points to localhost:3001, fix it to use the correct port or environment URL
    if (url.includes('localhost:3001')) {
      const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3002';
      return url.replace('http://localhost:3001', apiBaseUrl);
    }

    return url;
  }

  async create(userId: string, createDto: CreateHackathonDto) {
    const { paymentId, providerPaymentId, ...hackathonData } = createDto;

    // 1. Verify payment status (outside transaction to avoid complex locking on external updates)
    await this.paymentsService.verifyPayment(paymentId, providerPaymentId);

    // 2. Use transaction to link Hackathon creation with Payment update
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the hackathon
      const hackathon = await tx.hackathon.create({
        data: {
          title: hackathonData.title,
          description: hackathonData.description || '',
          whyParticipate: hackathonData.whyParticipate || '',
          category: hackathonData.category || 'WEB_DEVELOPMENT',
          type: hackathonData.allowIndividual ? 'INDIVIDUAL' : 'TEAM',
          status: 'UPCOMING',
          minTeamSize: hackathonData.minTeamSize || 1,
          maxTeamSize: hackathonData.maxTeamSize || 5,
          startDate: new Date(hackathonData.startDate),
          endDate: new Date(hackathonData.endDate),
          registrationStart: hackathonData.registrationStart ? new Date(hackathonData.registrationStart) : null,
          registrationDeadline: hackathonData.registrationEnd ? new Date(hackathonData.registrationEnd) : null,
          submissionDeadline: hackathonData.submissionDeadline ? new Date(hackathonData.submissionDeadline) : null,
          organizerId: userId,
          bannerUrl: hackathonData.bannerImageUrl,
          logoUrl: hackathonData.logoImageUrl,
          location: hackathonData.venue,
          isVirtual: hackathonData.isVirtual || false,
          prizeAmount: hackathonData.prizeAmount ? parseFloat(hackathonData.prizeAmount.toString()) : 0,
          prizeCurrency: hackathonData.prizeCurrency || 'USD',
          prizePool: hackathonData.prizeAmount ? `${hackathonData.prizeCurrency || 'USD'} ${hackathonData.prizeAmount}` : null,
          expectedOutcome: hackathonData.expectedOutcome,
          rules: hackathonData.rules,
          guidelines: hackathonData.guidelines,
          termsAndConditions: hackathonData.termsAndConditions,
          contactPerson: hackathonData.contactPerson,
          contactEmail: hackathonData.contactEmail,
          contactPhone: hackathonData.contactPhone,
          judges: hackathonData.judges as any,
          judgingCriteria: hackathonData.judgingCriteria as any,
          registrationFee: hackathonData.registrationFee != null ? parseFloat(hackathonData.registrationFee.toString()) : null,
        },
        include: {
          organizer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Create problem statement tracks if provided
      if (hackathonData.problemStatementTracks && hackathonData.problemStatementTracks.length > 0) {
        await Promise.all(
          hackathonData.problemStatementTracks.map(track =>
            tx.hackathonProblemStatement.create({
              data: {
                hackathonId: hackathon.id,
                uploadedById: userId,
                trackNumber: track.trackNumber,
                trackTitle: track.trackTitle,
                fileName: track.fileName,
                fileUrl: track.fileUrl,
                fileType: track.fileType,
                fileSize: track.fileSize,
                description: track.description,
              },
            })
          )
        );
      }

      // Link payment to hackathon
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          hackathonId: hackathon.id,
          status: 'SUCCESS'
        },
      });

      return { hackathon, updatedPayment };
    });

    const { hackathon, updatedPayment } = result;

    // 3. Send Receipt Email proactively (only if real payment)
    if (updatedPayment) {
      try {
        const receipt = paymentReceiptEmail(
          hackathon.organizer.firstName,
          hackathon.title,
          updatedPayment.amount,
          updatedPayment.currency,
          updatedPayment.providerPaymentId!,
          updatedPayment.invoiceId,
          new Date().toLocaleDateString()
        );

        await this.emailService.sendEmailWithLogging(
          hackathon.organizer.email,
          receipt.subject,
          receipt.html
        );
      } catch (error) {
        console.error('❌ Failed to send payment receipt email:', error);
        // We don't throw here as the hackathon is already created and payment is linked
      }
    }

    // 4. Notify all participants about new hackathon
    try {
      const organizerName = `${hackathon.organizer.firstName} ${hackathon.organizer.lastName}`;
      await this.notificationsService.notifyAllParticipantsNewHackathon(
        hackathon.id,
        hackathon.title,
        organizerName
      );
      console.log('✅ Notified all participants about new hackathon');
    } catch (error) {
      console.error('❌ Failed to notify participants:', error);
      // Don't fail hackathon creation if notifications fail
    }

    return {
      ...hackathon,
      bannerImageUrl: this.ensureAbsoluteUrl(hackathon.bannerUrl),
      logoImageUrl: this.ensureAbsoluteUrl(hackathon.logoUrl)
    };
  }

  async findAll(filters?: { status?: string; category?: string; search?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const hackathons = await this.prisma.hackathon.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        problemStatements: true,
        _count: {
          select: {
            participants: true,
            teams: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // CRITICAL FIX: Always construct proper URLs for problem statement files
    return hackathons.map(hackathon => ({
      ...hackathon,
      bannerImageUrl: this.ensureAbsoluteUrl(hackathon.bannerUrl), // Map bannerUrl to bannerImageUrl for frontend
      logoImageUrl: this.ensureAbsoluteUrl(hackathon.logoUrl), // Map logoUrl to logoImageUrl for frontend
      problemStatements: hackathon.problemStatements?.map(ps => {
        // Extract the actual filename from the existing URL
        let actualFilename = ps.fileName;
        if (ps.fileUrl && ps.fileUrl.includes('/')) {
          const urlParts = ps.fileUrl.split('/');
          actualFilename = urlParts[urlParts.length - 1];
        }

        return {
          ...ps,
          fileUrl: `http://localhost:3002/uploads/hackathons/problem-statements/${ps.uploadedById}/${actualFilename}`,
        };
      }) || [],
    }));
  }

  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        problemStatements: true,
        _count: {
          select: {
            participants: true,
            teams: true,
            submissions: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // CRITICAL FIX: Always construct proper URLs for problem statement files
    // Files are stored in uploads/hackathons/problem-statements/{uploadedById}/{actualFilename}
    // The uploadedById is the organizer's user ID who uploaded the file
    const hackathonWithFixedUrls = {
      ...hackathon,
      bannerImageUrl: this.ensureAbsoluteUrl(hackathon.bannerUrl), // Map bannerUrl to bannerImageUrl for frontend
      logoImageUrl: this.ensureAbsoluteUrl(hackathon.logoUrl), // Map logoUrl to logoImageUrl for frontend
      problemStatements: hackathon.problemStatements?.map(ps => {
        // Extract the actual filename from the existing URL
        let actualFilename = ps.fileName;
        if (ps.fileUrl && ps.fileUrl.includes('/')) {
          const urlParts = ps.fileUrl.split('/');
          actualFilename = urlParts[urlParts.length - 1];
        }

        return {
          ...ps,
          fileUrl: `http://localhost:3002/uploads/hackathons/problem-statements/${ps.uploadedById}/${actualFilename}`,
        };
      }) || [],
    };

    return hackathonWithFixedUrls;
  }

  async update(userId: string, id: string, updateDto: UpdateHackathonDto) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (hackathon.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own hackathons');
    }

    const updated = await this.prisma.hackathon.update({
      where: { id },
      data: {
        ...(updateDto.title && { title: updateDto.title }),
        ...(updateDto.description && { description: updateDto.description }),
        ...(updateDto.startDate && { startDate: new Date(updateDto.startDate) }),
        ...(updateDto.endDate && { endDate: new Date(updateDto.endDate) }),
        ...(updateDto.registrationStart && { registrationStart: new Date(updateDto.registrationStart) }),
        ...(updateDto.registrationEnd && { registrationDeadline: new Date(updateDto.registrationEnd) }),
        ...(updateDto.submissionDeadline && { submissionDeadline: new Date(updateDto.submissionDeadline) }),
        ...(updateDto.bannerImageUrl !== undefined && { bannerUrl: updateDto.bannerImageUrl }),
        ...(updateDto.logoImageUrl !== undefined && { logoUrl: updateDto.logoImageUrl }),
        ...(updateDto.venue !== undefined && { location: updateDto.venue }),
        ...(updateDto.isVirtual !== undefined && { isVirtual: updateDto.isVirtual }),
        ...(updateDto.category && { category: updateDto.category }),
        ...(updateDto.whyParticipate !== undefined && { whyParticipate: updateDto.whyParticipate }),
        ...(updateDto.expectedOutcome !== undefined && { expectedOutcome: updateDto.expectedOutcome }),
        ...(updateDto.rules !== undefined && { rules: updateDto.rules }),
        ...(updateDto.guidelines !== undefined && { guidelines: updateDto.guidelines }),
        ...(updateDto.termsAndConditions !== undefined && { termsAndConditions: updateDto.termsAndConditions }),
        ...(updateDto.contactPerson !== undefined && { contactPerson: updateDto.contactPerson }),
        ...(updateDto.contactEmail !== undefined && { contactEmail: updateDto.contactEmail }),
        ...(updateDto.contactPhone !== undefined && { contactPhone: updateDto.contactPhone }),
        ...(updateDto.prizeAmount !== undefined && { prizeAmount: parseFloat(updateDto.prizeAmount.toString()) }),
        ...(updateDto.prizeCurrency !== undefined && { prizeCurrency: updateDto.prizeCurrency }),
        ...(updateDto.judges !== undefined && { judges: updateDto.judges as any }),
        ...(updateDto.judgingCriteria !== undefined && { judgingCriteria: updateDto.judgingCriteria as any }),
        ...(updateDto.registrationFee !== undefined && { registrationFee: updateDto.registrationFee != null ? parseFloat(updateDto.registrationFee.toString()) : null }),
      },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ...updated,
      bannerImageUrl: this.ensureAbsoluteUrl(updated.bannerUrl),
      logoImageUrl: this.ensureAbsoluteUrl(updated.logoUrl),
    };
  }

  async remove(userId: string, id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (hackathon.organizerId !== userId) {
      throw new ForbiddenException('You can only delete your own hackathons');
    }

    await this.prisma.hackathon.delete({
      where: { id },
    });

    return { message: 'Hackathon deleted successfully' };
  }

  async publish(userId: string, id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (hackathon.organizerId !== userId) {
      throw new ForbiddenException('You can only publish your own hackathons');
    }

    const updated = await this.prisma.hackathon.update({
      where: { id },
      data: { status: 'LIVE' },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }

  async registerForHackathon(
    userId: string,
    hackathonId: string,
    registrationData?: {
      teamName?: string;
      teamDescription?: string;
      teamMembers?: Array<{ name: string; email: string; role: string }>;
      selectedTrack?: number;
      paymentId?: string;
      providerPaymentId?: string;
    },
  ) {
    console.log('🔄 Registration request:', { userId, hackathonId, registrationData });

    // 1. Verify payment if provided (mandatory for now based on user request)
    if (registrationData?.paymentId && registrationData?.providerPaymentId) {
      // Verify payment
      await this.paymentsService.verifyPayment(
        registrationData.paymentId,
        registrationData.providerPaymentId
      );

      // Mark payment as success (without linking to hackathon to avoid unique constraint)
      await this.prisma.payment.update({
        where: { id: registrationData.paymentId },
        data: { status: 'SUCCESS' }
      });
    } else {
      // For now, we'll allow registration without payment if not provided, 
      // but in a strict flow we should throw BadRequestException.
      // Given the frontend will enforce it, we can log a warning.
      console.warn('⚠️ Registering without payment details');
    }

    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if already registered
    const existing = await this.prisma.hackathonParticipant.findUnique({
      where: {
        userId_hackathonId: {
          userId,
          hackathonId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You are already registered for this hackathon');
    }

    // If team registration (check if teamName is provided and not empty)
    if (registrationData?.teamName && registrationData.teamName.trim()) {
      console.log('✅ Creating team:', registrationData.teamName);

      // Create team
      const team = await this.prisma.team.create({
        data: {
          name: registrationData.teamName,
          description: registrationData.teamDescription || '',
          hackathonId,
          leaderId: userId,
        },
      });

      console.log('✅ Team created:', team.id);

      // Create participant record for team leader
      const leaderParticipant = await this.prisma.hackathonParticipant.create({
        data: {
          userId,
          hackathonId,
          teamId: team.id,
          role: 'LEADER',
          selectedTrack: registrationData.selectedTrack,
        },
      });

      console.log('✅ Team leader participant created:', leaderParticipant.id);

      // Create participant records for team members
      // Note: In a real app, you'd send invitations and create participants when they accept
      // For now, we'll just store the emails in the team description or handle separately

      // Send registration email
      try {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          const { registrationEmail } = await import('../utils/emailTemplates');
          const emailTemplate = registrationEmail(
            `${user.firstName} ${user.lastName}`,
            hackathon.title,
            new Date(hackathon.startDate).toLocaleDateString(),
            new Date(hackathon.endDate).toLocaleDateString()
          );

          // @ts-ignore
          const emailService = new EmailService(this.prisma);
          await emailService.sendEmailWithLogging(user.email, emailTemplate.subject, emailTemplate.html);
        }
      } catch (error) {
        console.error('Failed to send registration email:', error);
        // Don't fail registration if email fails
      }

      // Notify host about new participant registration
      try {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user && hackathon.organizerId) {
          await this.notificationsService.notifyHostParticipantRegistered(
            hackathon.organizerId,
            hackathon.id,
            hackathon.title,
            `${user.firstName} ${user.lastName} (Team: ${registrationData.teamName})`
          );
        }
      } catch (error) {
        console.error('Failed to send notification to host:', error);
      }

      return {
        success: true,
        message: 'Successfully registered team for hackathon',
        participant: leaderParticipant,
        team,
      };
    }

    console.log('✅ Creating individual participant');

    // Individual registration
    const participant = await this.prisma.hackathonParticipant.create({
      data: {
        userId,
        hackathonId,
        role: 'MEMBER',
        selectedTrack: registrationData?.selectedTrack,
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log('✅ Individual participant created:', participant.id);

    // Send registration email
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && participant.hackathon) {
        const { registrationEmail } = await import('../utils/emailTemplates');
        const emailTemplate = registrationEmail(
          `${user.firstName} ${user.lastName}`,
          participant.hackathon.title,
          new Date(hackathon.startDate).toLocaleDateString(),
          new Date(hackathon.endDate).toLocaleDateString()
        );

        // @ts-ignore
        const emailService = new EmailService(this.prisma);
        await emailService.sendEmailWithLogging(user.email, emailTemplate.subject, emailTemplate.html);
      }
    } catch (error) {
      console.error('Failed to send registration email:', error);
      // Don't fail registration if email fails
    }

    // Notify host about new participant registration
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && hackathon.organizerId) {
        await this.notificationsService.notifyHostParticipantRegistered(
          hackathon.organizerId,
          hackathon.id,
          hackathon.title,
          `${user.firstName} ${user.lastName}`
        );
      }
    } catch (error) {
      console.error('Failed to send notification to host:', error);
      // Don't fail registration if notification fails
    }

    // Notify participant about successful registration
    try {
      await this.notificationsService.notifyParticipantRegistrationSuccess(
        userId,
        hackathon.id,
        hackathon.title
      );
    } catch (error) {
      console.error('Failed to send notification to participant:', error);
      // Don't fail registration if notification fails
    }

    return {
      success: true,
      message: 'Successfully registered for hackathon',
      participant,
    };
  }

  async getMyHackathons(userId: string) {
    console.log('🔍 getMyHackathons called for userId:', userId);

    // CRITICAL FIX: Get hackathons where user is the ORGANIZER (not participant)
    // This is for the organizer dashboard, so we need hackathons they created
    const organizedHackathons = await this.prisma.hackathon.findMany({
      where: { organizerId: userId },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        problemStatements: true,
        _count: {
          select: {
            participants: true,
            teams: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📊 Found organized hackathons:', organizedHackathons.length);

    // CRITICAL FIX: Always construct proper URLs for problem statement files
    const hackathonsWithFixedUrls = organizedHackathons.map(hackathon => ({
      ...hackathon,
      bannerImageUrl: this.ensureAbsoluteUrl(hackathon.bannerUrl),
      logoImageUrl: this.ensureAbsoluteUrl(hackathon.logoUrl),
      registrationEnd: hackathon.registrationDeadline, // Map registrationDeadline to registrationEnd
      problemStatements: hackathon.problemStatements?.map(ps => {
        // Extract the actual filename from the existing URL
        let actualFilename = ps.fileName;
        if (ps.fileUrl && ps.fileUrl.includes('/')) {
          const urlParts = ps.fileUrl.split('/');
          actualFilename = urlParts[urlParts.length - 1];
        }

        return {
          ...ps,
          fileUrl: `http://localhost:3002/uploads/hackathons/problem-statements/${ps.uploadedById}/${actualFilename}`,
        };
      }) || [],
    }));

    console.log('✅ Returning hackathons with fixed URLs:', hackathonsWithFixedUrls.length);
    return hackathonsWithFixedUrls;
  }

  async getParticipants(hackathonId: string) {
    const participants = await this.prisma.hackathonParticipant.findMany({
      where: { hackathonId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phoneNumber: true,
          },
        },
        hackathon: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            submissionDeadline: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Check if participant has submitted + fetch payment
    const participantsWithSubmission = await Promise.all(
      participants.map(async (participant) => {
        const submission = await this.prisma.submission.findFirst({
          where: {
            hackathonId,
            OR: [
              { participantId: participant.id },
              { teamId: participant.teamId },
            ],
          },
        });

        // Fetch participant's payment for this hackathon
        const payment = await this.prisma.payment.findFirst({
          where: {
            hostId: participant.userId,
            hackathonId,
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
          ...participant,
          hasSubmission: !!submission,
          submissionId: submission?.id || null,
          payment: payment || null,
        };
      }),
    );

    return participantsWithSubmission;
  }

  async updateStatus(userId: string, hackathonId: string, status: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (hackathon.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own hackathons');
    }

    // Map frontend/API status values to Prisma schema (UPCOMING, LIVE, ENDED)
    const statusMap: Record<string, 'UPCOMING' | 'LIVE' | 'ENDED'> = {
      DRAFT: 'UPCOMING',
      UPCOMING: 'UPCOMING',
      PUBLISHED: 'LIVE',
      REGISTRATION_OPEN: 'LIVE',
      IN_PROGRESS: 'LIVE',
      SUBMISSION_OPEN: 'LIVE',
      LIVE: 'LIVE',
      COMPLETED: 'ENDED',
      ENDED: 'ENDED',
      CANCELLED: 'UPCOMING',
    };
    const prismaStatus = statusMap[status] ?? 'UPCOMING';

    const updated = await this.prisma.hackathon.update({
      where: { id: hackathonId },
      data: { status: prismaStatus },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }
}
