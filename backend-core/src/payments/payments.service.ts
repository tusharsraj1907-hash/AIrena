import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HACKATHON_CREATION_FEE, PAYMENT_CURRENCY } from '../common/constants/payments';
import { v4 as uuidv4 } from 'uuid';
import { EmailService as UtilsEmailService } from '../utils/emailService';
import { EmailService } from '../notifications/email.service';
import { paymentReceiptEmail } from '../utils/emailTemplates';
import { PaymentReceiptService } from './payment-receipt.service';

@Injectable()
export class PaymentsService {
    private emailService = new EmailService();

    constructor(
        private prisma: PrismaService,
        private utilsEmailService: UtilsEmailService,
        private receiptService: PaymentReceiptService,
    ) { }

    async createOrder(hostId: string) {
        const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const payment = await this.prisma.payment.create({
            data: {
                hostId,
                amount: HACKATHON_CREATION_FEE,
                currency: PAYMENT_CURRENCY,
                status: 'PENDING',
                invoiceId,
            },
        });

        return {
            paymentId: payment.id,
            userId: payment.hostId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            createdAt: payment.createdAt,
            invoiceId: payment.invoiceId,
            // Mock order ID for frontend to simulate Razorpay flow
            mockOrderId: `order_${uuidv4().replace(/-/g, '')}`,
        };
    }

    private async sendPaymentReceiptEmail(payment: any) {
        try {
            const host = await this.prisma.user.findUnique({
                where: { id: payment.hostId }
            });

            if (!host) {
                console.warn(`Host with ID ${payment.hostId} not found, skipping email`);
                return;
            }

            const emailTemplate = paymentReceiptEmail(
                `${host.firstName} ${host.lastName}`,
                payment.hackathon?.title || 'Hackathon Creation',
                payment.amount,
                payment.currency,
                payment.providerPaymentId || payment.id,
                payment.invoiceId,
                new Date(payment.createdAt).toLocaleDateString()
            );

            await this.utilsEmailService.sendEmailWithLogging(
                payment.userEmail || host.email,
                emailTemplate.subject,
                emailTemplate.html
            );
            console.log(`Payment receipt email sent to ${payment.userEmail || host.email}`);
        } catch (error) {
            console.error('Error sending payment receipt email:', error);
        }
    }

    async verifyPayment(paymentId: string, providerPaymentId: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment) {
            throw new BadRequestException('Payment record not found');
        }

        if (payment.status === 'SUCCESS') {
            return payment;
        }

        // Cryptographic verification (mocked for now)
        // Success if providerPaymentId starts with 'pay_' (Razorpay) or 'test_provider_' (Mock)
        const isVerified = providerPaymentId.startsWith('pay_') || providerPaymentId.startsWith('test_provider_');

        if (!isVerified) {
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'FAILED' },
            });
            throw new BadRequestException('Payment verification failed');
        }

        const user = await this.prisma.user.findUnique({ where: { id: payment.hostId } });

        const updatedPayment = await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'SUCCESS',
                providerPaymentId,
                userEmail: user?.email,
                paymentMethod: 'CARD',
            },
            include: {
                hackathon: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        // Send payment receipt email asynchronously
        this.sendPaymentReceiptEmail(updatedPayment);

        await this.emailService.sendPaymentReceipt({
            email: user.email,
            name: user.firstName,
            amount: payment.amount,
            paymentId: payment.id,
            hackathonTitle: updatedPayment.hackathon?.title,
        });

        return updatedPayment;
    }

    async getPaymentHistory(userId: string) {
        return this.prisma.payment.findMany({
            where: { hostId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                hackathon: { select: { title: true } },
            },
        });
    }

    async getPaymentById(paymentId: string, requestingUserId: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                hackathon: { select: { title: true } },
                host: { select: { firstName: true, lastName: true, email: true } },
            },
        });

        if (!payment) return null;

        // Only allow owner to download their own receipt
        if (payment.hostId !== requestingUserId) return null;

        return {
            ...payment,
            hackathonName: payment.hackathon?.title || 'Hackathon',
            userName: `${payment.host.firstName} ${payment.host.lastName}`,
        };
    }

    // ── PARTICIPANT PAYMENT FLOW ─────────────────────────────────────────────

    async createParticipantOrder(participantId: string, hackathonId: string) {
        const hackathon = await this.prisma.hackathon.findUnique({
            where: { id: hackathonId },
            select: { id: true, title: true, registrationFee: true, prizeCurrency: true },
        });

        if (!hackathon) {
            throw new BadRequestException('Hackathon not found');
        }

        const fee = hackathon.registrationFee ?? 0;
        const invoiceId = `PART-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const payment = await this.prisma.payment.create({
            data: {
                hostId: participantId,   // reuse hostId field for the payer
                amount: fee,
                currency: hackathon.prizeCurrency || 'INR',
                status: 'PENDING',
                invoiceId,
                hackathonId: hackathon.id,
            },
        });

        return {
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            invoiceId: payment.invoiceId,
            hackathonTitle: hackathon.title,
            mockOrderId: `order_${uuidv4().replace(/-/g, '')}`,
        };
    }

    async verifyParticipantPayment(paymentId: string, providerPaymentId: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { hackathon: { select: { title: true } } },
        });

        if (!payment) {
            throw new BadRequestException('Payment record not found');
        }

        if (payment.status === 'SUCCESS') {
            return payment;
        }

        const isVerified = providerPaymentId.startsWith('pay_') || providerPaymentId.startsWith('test_provider_');

        if (!isVerified) {
            await this.prisma.payment.update({ where: { id: paymentId }, data: { status: 'FAILED' } });
            throw new BadRequestException('Payment verification failed');
        }

        const participant = await this.prisma.user.findUnique({ where: { id: payment.hostId } });

        const updated = await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'SUCCESS', providerPaymentId, userEmail: participant?.email, paymentMethod: 'CARD' },
            include: { hackathon: { select: { title: true } } },
        });

        // Generate PDF receipt and attach to email
        if (participant) {
            try {
                // Step 10: Generate and save PDF
                const receiptPath = await this.receiptService.generateReceiptPDF(paymentId, {
                    receiptId: updated.id,
                    userName: `${participant.firstName} ${participant.lastName}`,
                    userEmail: participant.email,
                    hackathonName: updated.hackathon?.title || 'Hackathon',
                    amount: updated.amount,
                    currency: updated.currency,
                    paymentDate: new Date(updated.createdAt).toLocaleDateString('en-IN'),
                    paymentMethod: updated.paymentMethod || 'Online',
                    status: updated.status,
                    invoiceId: updated.invoiceId,
                });

                // Save receipt path to DB
                await this.prisma.payment.update({
                    where: { id: paymentId },
                    data: { receiptUrl: receiptPath },
                });

                console.log(`✅ PDF receipt saved: ${receiptPath}`);

                // Step 13: Send email with PDF attachment
                const emailTemplate = paymentReceiptEmail(
                    `${participant.firstName} ${participant.lastName}`,
                    updated.hackathon?.title || 'Hackathon',
                    updated.amount,
                    updated.currency,
                    updated.providerPaymentId || updated.id,
                    updated.invoiceId,
                    new Date(updated.createdAt).toLocaleDateString(),
                );

                await this.utilsEmailService.sendEmailWithLogging(
                    participant.email,
                    emailTemplate.subject,
                    emailTemplate.html,
                    [
                        {
                            filename: `receipt-${updated.invoiceId}.pdf`,
                            path: receiptPath,
                        },
                    ],
                );
                console.log(`✅ Participant receipt email + PDF sent to ${participant.email}`);
            } catch (err) {
                console.error('Error generating/sending participant receipt:', err);
            }
        }

        return updated;
    }
}

