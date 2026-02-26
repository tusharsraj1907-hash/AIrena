import { mailer } from './mailer';

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  retries = 3,
  attachments?: Array<{ filename: string; path: string }>
) {
  for (let i = 0; i < retries; i++) {
    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        attachments: attachments || [],
      });
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}