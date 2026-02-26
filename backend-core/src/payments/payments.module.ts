import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentReceiptService } from './payment-receipt.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../utils/emailService';

@Module({
    imports: [PrismaModule],
    providers: [PaymentsService, PaymentReceiptService, EmailService],
    controllers: [PaymentsController],
    exports: [PaymentsService, PaymentReceiptService],
})
export class PaymentsModule { }
