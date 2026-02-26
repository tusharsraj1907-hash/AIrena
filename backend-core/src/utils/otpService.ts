import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './emailService';
import { otpEmail } from './emailTemplates';

export class OtpService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store hashed OTP
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        otpHash,
        otpExpiresAt,
      },
    });

    // Send email
    const emailTemplate = otpEmail(otp);
    await this.emailService.sendEmailWithLogging(
      user.email,
      emailTemplate.subject,
      emailTemplate.html
    );
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return false;
    }

    // Check expiry
    if (new Date() > user.otpExpiresAt) {
      // Clear expired OTP
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          otpHash: null,
          otpExpiresAt: null,
        },
      });
      return false;
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.otpHash);

    if (isValid) {
      // Mark email as verified and clear OTP
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          otpHash: null,
          otpExpiresAt: null,
        },
      });
    }

    return isValid;
  }
}