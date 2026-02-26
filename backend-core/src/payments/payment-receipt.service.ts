import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';

export interface ReceiptData {
    receiptId: string;
    userName: string;
    userEmail: string;
    hackathonName: string;
    amount: number;
    currency: string;
    paymentDate: string;
    paymentMethod: string;
    status: string;
    invoiceId: string;
}

@Injectable()
export class PaymentReceiptService {
    private readonly receiptsDir: string;

    constructor() {
        // Store receipts in uploads/receipts relative to project root
        this.receiptsDir = path.join(process.cwd(), 'uploads', 'receipts');
        if (!fs.existsSync(this.receiptsDir)) {
            fs.mkdirSync(this.receiptsDir, { recursive: true });
        }
    }

    getReceiptPath(paymentId: string): string {
        return path.join(this.receiptsDir, `receipt-${paymentId}.pdf`);
    }

    receiptExists(paymentId: string): boolean {
        return fs.existsSync(this.getReceiptPath(paymentId));
    }

    /**
     * Generates a PDF receipt and saves it to uploads/receipts/receipt-{paymentId}.pdf
     * Returns the file path.
     */
    async generateReceiptPDF(paymentId: string, data: ReceiptData): Promise<string> {
        const filePath = this.getReceiptPath(paymentId);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // ─── Header ───────────────────────────────────────────────────
            doc
                .rect(0, 0, doc.page.width, 100)
                .fill('#0f172a');

            doc
                .fillColor('#60a5fa')
                .fontSize(28)
                .font('Helvetica-Bold')
                .text('AIrena', 50, 30);

            doc
                .fillColor('#94a3b8')
                .fontSize(12)
                .font('Helvetica')
                .text('Hackathon Platform', 50, 62);

            doc
                .fillColor('#ffffff')
                .fontSize(18)
                .font('Helvetica-Bold')
                .text('PAYMENT RECEIPT', 0, 38, { align: 'right' });

            // ─── Receipt metadata ─────────────────────────────────────────
            doc.moveDown(4);

            const statusColor = data.status === 'SUCCESS' ? '#10b981' : '#ef4444';

            doc
                .fillColor('#1e293b')
                .rect(50, 120, doc.page.width - 100, 60)
                .fill();

            doc
                .fillColor('#94a3b8')
                .fontSize(10)
                .font('Helvetica')
                .text('INVOICE ID', 70, 132);

            doc
                .fillColor('#e2e8f0')
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(data.invoiceId, 70, 147);

            doc
                .fillColor('#94a3b8')
                .fontSize(10)
                .font('Helvetica')
                .text('DATE', 300, 132);

            doc
                .fillColor('#e2e8f0')
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(data.paymentDate, 300, 147);

            doc
                .fillColor('#94a3b8')
                .fontSize(10)
                .font('Helvetica')
                .text('STATUS', 450, 132);

            doc
                .fillColor(statusColor)
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(data.status, 450, 147);

            // ─── Divider ──────────────────────────────────────────────────
            doc
                .moveTo(50, 200)
                .lineTo(doc.page.width - 50, 200)
                .strokeColor('#334155')
                .stroke();

            // ─── Bill To ──────────────────────────────────────────────────
            doc
                .fillColor('#64748b')
                .fontSize(10)
                .font('Helvetica')
                .text('BILL TO', 50, 220);

            doc
                .fillColor('#0f172a')
                .fontSize(14)
                .font('Helvetica-Bold')
                .text(data.userName, 50, 236);

            doc
                .fillColor('#475569')
                .fontSize(11)
                .font('Helvetica')
                .text(data.userEmail, 50, 254);

            // ─── Payment Details Table ────────────────────────────────────
            const tableTop = 310;
            const tableLeft = 50;
            const tableRight = doc.page.width - 50;

            // Table header
            doc
                .rect(tableLeft, tableTop, tableRight - tableLeft, 30)
                .fill('#1e293b');

            doc
                .fillColor('#94a3b8')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('DESCRIPTION', tableLeft + 10, tableTop + 10)
                .text('DETAILS', tableLeft + 300, tableTop + 10);

            // Row 1
            const row1Y = tableTop + 30;
            doc
                .rect(tableLeft, row1Y, tableRight - tableLeft, 28)
                .fill('#f8fafc');
            doc
                .fillColor('#374151')
                .fontSize(11)
                .font('Helvetica')
                .text('Hackathon Registration', tableLeft + 10, row1Y + 8)
                .text(data.hackathonName, tableLeft + 300, row1Y + 8);

            // Row 2
            const row2Y = row1Y + 28;
            doc
                .rect(tableLeft, row2Y, tableRight - tableLeft, 28)
                .fill('#ffffff');
            doc
                .fillColor('#374151')
                .text('Payment Method', tableLeft + 10, row2Y + 8)
                .text(data.paymentMethod || 'Online', tableLeft + 300, row2Y + 8);

            // Row 3
            const row3Y = row2Y + 28;
            doc
                .rect(tableLeft, row3Y, tableRight - tableLeft, 28)
                .fill('#f8fafc');
            doc
                .fillColor('#374151')
                .text('Receipt ID', tableLeft + 10, row3Y + 8)
                .text(data.receiptId, tableLeft + 300, row3Y + 8);

            // ─── Amount Section ───────────────────────────────────────────
            const amtY = row3Y + 60;
            doc
                .rect(tableLeft, amtY, tableRight - tableLeft, 50)
                .fill('#0f172a');

            doc
                .fillColor('#94a3b8')
                .fontSize(12)
                .font('Helvetica')
                .text('TOTAL AMOUNT PAID', tableLeft + 10, amtY + 12);

            const amountDisplay = data.amount === 0 ? 'FREE' : `${data.currency} ${data.amount.toLocaleString('en-IN')}`;

            doc
                .fillColor('#60a5fa')
                .fontSize(22)
                .font('Helvetica-Bold')
                .text(amountDisplay, 0, amtY + 14, { align: 'right', width: doc.page.width - 60 });

            // ─── Footer ───────────────────────────────────────────────────
            doc
                .fillColor('#94a3b8')
                .fontSize(9)
                .font('Helvetica')
                .text(
                    'This is a computer-generated receipt. No signature required.',
                    50,
                    doc.page.height - 80,
                    { align: 'center', width: doc.page.width - 100 }
                )
                .text(
                    'AIrena Hackathon Platform  •  support@airena.io',
                    50,
                    doc.page.height - 65,
                    { align: 'center', width: doc.page.width - 100 }
                );

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
}
