const nodemailer = require('nodemailer');
require('dotenv').config();

(async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('⏳ Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP AUTH SUCCESS');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER, // send to yourself
      subject: 'SMTP TEST – AIrena',
      html: '<h2>SMTP is working 🎉</h2>',
    });

    console.log('✅ EMAIL SENT:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP FAILED:', err.message);
  }
})();
