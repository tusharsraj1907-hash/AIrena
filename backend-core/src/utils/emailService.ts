import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sendEmail } from './sendEmail';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) { }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async sendEmailWithLogging(
    to: string,
    subject: string,
    html: string,
    attachments?: Array<{ filename: string; path: string }>
  ): Promise<void> {
    // Validate email format
    if (!this.isValidEmail(to)) {
      await this.prisma.emailLog.create({
        data: {
          to,
          subject,
          status: 'FAILED',
          error: 'Invalid email format',
        },
      });
      throw new Error('Invalid email format');
    }

    let lastError: Error | null = null;

    // Try sending with retry logic for transient failures
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await sendEmail(to, subject, html, 2, attachments);

        // Log success
        await this.prisma.emailLog.create({
          data: {
            to,
            subject,
            status: 'SENT',
          },
        });
        return; // Success, exit function
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Don't retry for invalid email errors
        if (lastError.message.includes('Invalid email') ||
          lastError.message.includes('recipient rejected') ||
          lastError.message.includes('mailbox unavailable')) {
          break;
        }

        // Wait before retry (only on first attempt)
        if (attempt === 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Log failure after all attempts
    await this.prisma.emailLog.create({
      data: {
        to,
        subject,
        status: 'FAILED',
        error: lastError?.message || 'Unknown error',
      },
    });

    throw lastError;
  }
}