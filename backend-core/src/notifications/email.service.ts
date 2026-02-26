import * as nodemailer from 'nodemailer';

export class EmailService {

  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendPaymentReceipt(data: {
    email: string;
    name: string;
    amount: number;
    paymentId: string;
    hackathonTitle?: string;
  }) {

    await this.transporter.sendMail({

      from: process.env.EMAIL_FROM,

      to: data.email,

      subject: "Payment Receipt - Airena",

      html: `
        <h2>Payment Successful</h2>

        <p>Hello ${data.name},</p>

        <p>Your payment was successful.</p>

        <hr/>

        <p><b>Payment ID:</b> ${data.paymentId}</p>

        <p><b>Amount:</b> ₹${data.amount}</p>

        <p><b>Hackathon:</b> ${data.hackathonTitle || '-'}</p>

        <p><b>Status:</b> SUCCESS</p>

        <hr/>

        <p>Airena Team</p>
      `,
    });

  }

}
