import { Controller, Post, Get, Body, UseGuards, Request, Param, Res, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { PaymentReceiptService } from './payment-receipt.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as fs from 'fs';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly receiptService: PaymentReceiptService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('create-order')
    async createOrder(@Request() req) {
        return this.paymentsService.createOrder(req.user.id);
    }

    @Post('create-participant-order')
    async createParticipantOrder(@Request() req, @Body() body: { hackathonId: string }) {
        return this.paymentsService.createParticipantOrder(req.user.id, body.hackathonId);
    }

    @Post('verify-participant-payment')
    async verifyParticipantPayment(@Request() req, @Body() body: { paymentId: string; providerPaymentId: string }) {
        return this.paymentsService.verifyParticipantPayment(body.paymentId, body.providerPaymentId);
    }

    @Get('history')
    async getHistory(@Request() req) {
        return this.paymentsService.getPaymentHistory(req.user.id);
    }

    /**
     * GET /payments/receipt/:paymentId
     * Downloads the PDF receipt. Auto-generates on-demand if not yet created.
     */
    @Get('receipt/:paymentId')
    async downloadReceipt(
        @Param('paymentId') paymentId: string,
        @Request() req,
        @Res() res: Response,
    ) {
        try {
            // 1. Fetch payment + related data from DB directly
            const payment = await this.prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    hackathon: { select: { title: true } },
                    host: { select: { firstName: true, lastName: true, email: true } },
                },
            });

            if (!payment) {
                throw new NotFoundException('Payment not found');
            }

            // 2. Ownership check — only the payer can download their receipt
            if (payment.hostId !== req.user.id) {
                throw new NotFoundException('Payment not found');
            }

            // 3. Generate PDF if it doesn't exist yet
            const filePath = this.receiptService.getReceiptPath(paymentId);
            if (!fs.existsSync(filePath)) {
                await this.receiptService.generateReceiptPDF(paymentId, {
                    receiptId: payment.id,
                    userName: `${payment.host.firstName} ${payment.host.lastName}`,
                    userEmail: payment.host.email,
                    hackathonName: payment.hackathon?.title || 'AIrena Registration',
                    amount: payment.amount,
                    currency: payment.currency || 'INR',
                    paymentDate: new Date(payment.createdAt).toLocaleDateString('en-IN'),
                    paymentMethod: payment.paymentMethod || 'Online',
                    status: payment.status,
                    invoiceId: payment.invoiceId,
                });
            }

            // 4. Stream PDF to response
            if (!fs.existsSync(filePath)) {
                throw new InternalServerErrorException('Receipt could not be generated');
            }

            const stat = fs.statSync(filePath);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="receipt-${payment.invoiceId}.pdf"`,
                'Content-Length': stat.size,
            });

            const stream = fs.createReadStream(filePath);
            stream.on('error', () => res.status(500).end());
            stream.pipe(res);

        } catch (err) {
            console.error('❌ Receipt download error:', err?.message || err);
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException(err?.message || 'Failed to generate receipt');
        }
    }
}
