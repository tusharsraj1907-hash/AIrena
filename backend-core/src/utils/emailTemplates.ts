const base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIrena</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#0f172a;color:#e5e7eb;">
  <div style="background-color:#0f172a;padding:24px;min-height:100vh;">
    <div style="max-width:600px;margin:0 auto;background-color:#020617;border-radius:12px;padding:32px;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
      <!-- Header -->
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:12px;margin-bottom:16px;position:relative;">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-size:24px;">✨</div>
        </div>
        <h1 style="margin:0;font-size:28px;font-weight:bold;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">AIrena</h1>
        <p style="margin:8px 0 0 0;color:#94a3b8;font-size:14px;">Hackathon Platform</p>
      </div>
      
      <!-- Content -->
      <div style="color:#e5e7eb;line-height:1.6;">
        ${content}
      </div>
      
      <!-- Footer -->
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #334155;text-align:center;">
        <p style="margin:0;color:#64748b;font-size:12px;">
          © 2024 AIrena Hackathon Platform. All rights reserved.
        </p>
        <p style="margin:8px 0 0 0;color:#64748b;font-size:12px;">
          This email was sent to you because you have an account with AIrena.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const registrationEmail = (name: string, hackathon: string, startDate: string, endDate: string) => ({
  subject: `Welcome to ${hackathon} - Registration Confirmed!`,
  html: base(`
    <h2 style="color:#10b981;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Registration Successful! 🎉</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">Congratulations! You have successfully registered for <strong style="color:#60a5fa;">${hackathon}</strong>.</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #3b82f6;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Event Details</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Event:</strong> ${hackathon}</p>
        <p style="margin:0 0 8px 0;"><strong>Start Date:</strong> ${startDate}</p>
        <p style="margin:0 0 8px 0;"><strong>End Date:</strong> ${endDate}</p>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="color:white;margin:0;font-size:16px;font-weight:bold;">You are successfully registered! 🚀</p>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Get ready to innovate, collaborate, and build something amazing. We can't wait to see what you create!</p>
  `),
});

export const submissionEmail = (name: string, hackathon: string, projectTitle: string) => ({
  subject: `Project Submission Received - ${hackathon}`,
  html: base(`
    <h2 style="color:#10b981;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Submission Confirmed! ✅</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">Your project submission has been successfully received and is now under review.</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #10b981;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Submission Details</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Hackathon:</strong> ${hackathon}</p>
        <p style="margin:0 0 8px 0;"><strong>Project:</strong> ${projectTitle}</p>
        <p style="margin:0 0 8px 0;"><strong>Status:</strong> <span style="color:#10b981;">Submitted</span></p>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="color:white;margin:0;font-size:16px;font-weight:bold;">Your submission is now being reviewed! 🔍</p>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Good luck! We'll notify you once the judging process is complete.</p>
  `),
});

export const judgeDecisionEmail = (
  name: string,
  hackathon: string,
  projectTitle: string,
  decision: 'ACCEPTED' | 'REJECTED' | 'UNDER_REVIEW',
  feedback?: string
) => {
  const statusColors = {
    ACCEPTED: '#10b981',
    REJECTED: '#ef4444',
    UNDER_REVIEW: '#f59e0b'
  };

  const statusTexts = {
    ACCEPTED: 'Congratulations! Your submission has been accepted! 🎉',
    REJECTED: 'Your submission was not selected this time',
    UNDER_REVIEW: 'Your submission is under review'
  };

  return {
    subject: `${decision === 'ACCEPTED' ? 'Congratulations!' : 'Judging Update'} - ${hackathon}`,
    html: base(`
      <h2 style="color:${statusColors[decision]};font-size:24px;margin:0 0 24px 0;font-weight:bold;">Judging Results</h2>
      <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:16px;margin:0 0 24px 0;">The judging for your submission has been completed.</p>
      
      <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid ${statusColors[decision]};">
        <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Review Results</h3>
        <div style="color:#cbd5e1;">
          <p style="margin:0 0 8px 0;"><strong>Hackathon:</strong> ${hackathon}</p>
          <p style="margin:0 0 8px 0;"><strong>Project:</strong> ${projectTitle}</p>
          <p style="margin:0 0 16px 0;"><strong>Decision:</strong> <span style="color:${statusColors[decision]};font-weight:bold;">${decision.replace('_', ' ')}</span></p>
          ${feedback ? `
            <div style="background-color:#0f172a;border-radius:6px;padding:16px;margin-top:16px;">
              <p style="margin:0 0 8px 0;color:#f1f5f9;font-weight:bold;">Feedback:</p>
              <p style="margin:0;color:#cbd5e1;font-style:italic;">${feedback}</p>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div style="background:linear-gradient(135deg,${statusColors[decision]},${statusColors[decision]}dd);border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
        <p style="color:white;margin:0;font-size:16px;font-weight:bold;">${statusTexts[decision]}</p>
      </div>
      
      <p style="font-size:16px;margin:24px 0 0 0;">Thank you for your participation in ${hackathon}!</p>
    `),
  };
};

export const otpEmail = (otp: string) => ({
  subject: 'Verify Your Email - AIrena',
  html: base(`
    <h2 style="color:#3b82f6;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Email Verification Required 🔐</h2>
    <p style="font-size:16px;margin:0 0 24px 0;">Please verify your email address to complete your registration.</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:32px;margin:32px 0;text-align:center;border:2px solid #3b82f6;">
      <p style="margin:0 0 16px 0;color:#cbd5e1;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
      <div style="font-size:36px;font-weight:bold;color:#60a5fa;letter-spacing:8px;font-family:monospace;margin:16px 0;">${otp}</div>
      <p style="margin:16px 0 0 0;color:#94a3b8;font-size:14px;">This code expires in 10 minutes</p>
    </div>
    
    <div style="background-color:#fef3c7;border-radius:8px;padding:16px;margin:24px 0;border-left:4px solid #f59e0b;">
      <p style="margin:0;color:#92400e;font-size:14px;"><strong>Security Notice:</strong> Never share this code with anyone. AIrena will never ask for your verification code.</p>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">If you didn't request this verification, please ignore this email.</p>
  `),
});

export const hostRequestNotificationEmail = (hostName: string, hostEmail: string, requestedAt: string, userId: string, baseUrl: string = 'http://localhost:3002') => ({
  subject: 'New Host Approval Request - AIrena',
  html: base(`
    <h2 style="color:#f59e0b;font-size:24px;margin:0 0 24px 0;font-weight:bold;">New Host Approval Request 🏢</h2>
    <p style="font-size:16px;margin:0 0 24px 0;">A new user has requested host privileges on the AIrena platform.</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #f59e0b;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Host Request Details</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${hostName}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${hostEmail}</p>
        <p style="margin:0 0 8px 0;"><strong>Requested At:</strong> ${requestedAt}</p>
        <p style="margin:0 0 8px 0;"><strong>Status:</strong> <span style="color:#f59e0b;">Pending Approval</span></p>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div style="text-align:center;margin:32px 0;">
      <table style="margin:0 auto;border-spacing:16px 0;">
        <tr>
          <td>
            <a href="${baseUrl}/api/v1/admin/approve-host/${userId}?email=true" 
               style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:16px;text-align:center;min-width:120px;">
              ✅ APPROVE
            </a>
          </td>
          <td>
            <a href="${baseUrl}/api/v1/admin/reject-host/${userId}?email=true" 
               style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:16px;text-align:center;min-width:120px;">
              ❌ REJECT
            </a>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="color:white;margin:0;font-size:16px;font-weight:bold;">Click the buttons above to take action immediately!</p>
    </div>
    
    <div style="background-color:#0f172a;border-radius:8px;padding:16px;margin:24px 0;">
      <p style="margin:0;color:#94a3b8;font-size:14px;text-align:center;">
        <strong>Alternative:</strong> You can also log in to the admin dashboard to review this request.
      </p>
    </div>
  `),
});

export const hostApprovalEmail = (hostName: string, approvedAt: string) => ({
  subject: 'Host Account Approved - Welcome to AIrena! 🎉',
  html: base(`
    <h2 style="color:#10b981;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Host Account Approved! 🎉</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${hostName}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">Great news! Your host account has been approved and you can now start creating hackathons on AIrena.</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #10b981;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Account Status</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Status:</strong> <span style="color:#10b981;">Approved</span></p>
        <p style="margin:0 0 8px 0;"><strong>Approved At:</strong> ${approvedAt}</p>
        <p style="margin:0 0 8px 0;"><strong>Access Level:</strong> Host/Organizer</p>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="color:white;margin:0;font-size:16px;font-weight:bold;">You can now create and manage hackathons! 🚀</p>
    </div>
    
    <div style="background-color:#0f172a;border-radius:8px;padding:20px;margin:24px 0;">
      <h4 style="color:#f1f5f9;margin:0 0 12px 0;font-size:16px;">What you can do now:</h4>
      <ul style="color:#cbd5e1;margin:0;padding-left:20px;">
        <li style="margin-bottom:8px;">Create and manage hackathons</li>
        <li style="margin-bottom:8px;">Upload problem statements and resources</li>
        <li style="margin-bottom:8px;">Review and judge submissions</li>
        <li style="margin-bottom:8px;">Manage participants and teams</li>
      </ul>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Welcome to the AIrena host community! We're excited to see the amazing hackathons you'll create.</p>
  `),
});

export const hostRejectionEmail = (hostName: string, rejectedAt: string) => ({
  subject: 'Host Account Request Update - AIrena',
  html: base(`
    <h2 style="color:#ef4444;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Host Account Request Update</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${hostName}</strong>,</p>
    <p style="font-size:16px;margin:0 0 16px 0;">Thank you for your interest in becoming a host on AIrena. After careful review, we are unable to approve your host account request at this time.</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #ef4444;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Request Status</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Status:</strong> <span style="color:#ef4444;">Not Approved</span></p>
        <p style="margin:0 0 8px 0;"><strong>Reviewed At:</strong> ${rejectedAt}</p>
      </div>
    </div>
    
    <div style="background-color:#0f172a;border-radius:8px;padding:20px;margin:24px 0;">
      <h4 style="color:#f1f5f9;margin:0 0 12px 0;font-size:16px;">You can still:</h4>
      <ul style="color:#cbd5e1;margin:0;padding-left:20px;">
        <li style="margin-bottom:8px;">Participate in hackathons as a participant</li>
        <li style="margin-bottom:8px;">Join teams and submit projects</li>
        <li style="margin-bottom:8px;">Build your profile and showcase your skills</li>
        <li style="margin-bottom:8px;">Apply again in the future</li>
      </ul>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">If you have any questions about this decision, please feel free to contact our support team.</p>
  `),
});

export const dailyReminderEmail = (name: string, hackathon: string, organizer: string, deadline: string, daysLeft: number) => ({
  subject: `⏳ ${daysLeft} days left to submit – ${hackathon}`,
  html: base(`
    <h2 style="color:#60a5fa;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Don't forget to submit! ⏳</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">You're doing great! There are only <strong>${daysLeft} days left</strong> to submit your project for <strong style="color:#60a5fa;">${hackathon}</strong>.</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #3b82f6;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Hackathon Details</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Organizer:</strong> ${organizer}</p>
        <p style="margin:0 0 8px 0;"><strong>Submission Deadline:</strong> ${deadline}</p>
        <p style="margin:0 0 8px 0;"><strong>Time Left:</strong> ${daysLeft} days</p>
      </div>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="http://localhost:3001/dashboard" 
         style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:bold;font-size:16px;box-shadow:0 4px 15px rgba(59,130,246,0.3);">
        Submit Your Project 🚀
      </a>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">We can't wait to see what you've built!</p>
  `),
});

export const finalDayReminderEmail = (name: string, hackathon: string, deadline: string) => ({
  subject: `🚨 Last day to submit – ${hackathon}`,
  html: base(`
    <h2 style="color:#ef4444;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Today is the final day! 🚨</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">This is it! Today is the <strong>final day</strong> to submit your project for <strong style="color:#60a5fa;">${hackathon}</strong>. Don't let all your hard work go to waste!</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #ef4444;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Critical Deadline</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Hackathon:</strong> ${hackathon}</p>
        <p style="margin:0 0 8px 0;"><strong>Final Deadline:</strong> <span style="color:#ef4444;font-weight:bold;">${deadline}</span></p>
      </div>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="http://localhost:3001/dashboard" 
         style="display:inline-block;background:linear-gradient(135deg,#ef4444,#ef4444dd);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:bold;font-size:16px;box-shadow:0 4px 15px rgba(239,68,68,0.3);">
        Submit Now before it closes! 🚀
      </a>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Make sure your project is submitted before the clock runs out.</p>
  `),
});

export const oneHourReminderEmail = (name: string, hackathon: string) => ({
  subject: `⏰ 1 hour left! Submit now – ${hackathon}`,
  html: base(`
    <h2 style="color:#f59e0b;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Just 1 hour remaining! ⏰</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">Final call! There is only <strong>1 hour left</strong> before submissions close permanently for <strong style="color:#60a5fa;">${hackathon}</strong>.</p>
    
    <div style="background-color:#fffbeb;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #f59e0b;color:#92400e;">
      <strong>Warning:</strong> Submissions will close permanently in exactly 1 hour. No late submissions will be accepted.
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="http://localhost:3001/dashboard" 
         style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:bold;font-size:16px;box-shadow:0 4px 15px rgba(245,158,11,0.3);">
        Submit Your Project NOW! 🚀
      </a>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Hurry! You're almost there. Submit your project and show us what you've got!</p>
  `),
});
export const paymentReceiptEmail = (
  hostName: string,
  hackathonTitle: string,
  amount: number,
  currency: string,
  paymentId: string,
  invoiceId: string,
  date: string,
) => ({
  subject: `Payment Receipt - ${hackathonTitle} | Invoice ${invoiceId}`,
  html: base(`
    <h2 style="color:#10b981;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Payment Successful! ✅</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${hostName}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">Your payment for creating the hackathon <strong style="color:#60a5fa;">${hackathonTitle}</strong> has been confirmed. Please find your receipt below.</p>

    <!-- Receipt Table -->
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border:1px solid #334155;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #334155;">
        <div>
          <h3 style="color:#f1f5f9;margin:0;font-size:20px;font-weight:bold;">RECEIPT</h3>
          <p style="color:#64748b;margin:4px 0 0 0;font-size:13px;">AIrena Hackathon Platform</p>
        </div>
        <div style="text-align:right;">
          <p style="color:#10b981;margin:0;font-size:13px;font-weight:bold;">PAID</p>
          <p style="color:#94a3b8;margin:4px 0 0 0;font-size:13px;">${date}</p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#cbd5e1;">
        <tr style="border-bottom:1px solid #1e293b;">
          <td style="padding:10px 0;color:#94a3b8;">Invoice ID</td>
          <td style="padding:10px 0;text-align:right;font-family:monospace;">${invoiceId}</td>
        </tr>
        <tr style="border-bottom:1px solid #334155;">
          <td style="padding:10px 0;color:#94a3b8;">Payment ID</td>
          <td style="padding:10px 0;text-align:right;font-family:monospace;">${paymentId}</td>
        </tr>
        <tr style="border-bottom:1px solid #334155;">
          <td style="padding:10px 0;color:#94a3b8;">Hackathon</td>
          <td style="padding:10px 0;text-align:right;">${hackathonTitle}</td>
        </tr>
        <tr style="border-bottom:1px solid #334155;">
          <td style="padding:10px 0;color:#94a3b8;">Date</td>
          <td style="padding:10px 0;text-align:right;">${date}</td>
        </tr>
        <tr>
          <td style="padding:16px 0 8px 0;font-size:16px;font-weight:bold;color:#f1f5f9;">Total Paid</td>
          <td style="padding:16px 0 8px 0;text-align:right;font-size:20px;font-weight:bold;color:#10b981;">${currency} ${amount}</td>
        </tr>
      </table>
    </div>

    <!-- Download Receipt Button -->
    <div style="text-align:center;margin:28px 0;">
      <a href="http://localhost:3001/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:16px;box-shadow:0 4px 15px rgba(59,130,246,0.3);">
        ⬇️ Download Receipt
      </a>
      <p style="margin:12px 0 0 0;color:#64748b;font-size:13px;">
        Log in to your AIrena dashboard → Payment History → click <strong style="color:#94a3b8;">Receipt</strong> to download your PDF.
      </p>
    </div>

    <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="color:white;margin:0;font-size:16px;font-weight:bold;">Your hackathon is now being set up! 🚀</p>
    </div>

    <p style="font-size:16px;margin:24px 0 0 0;">You can now manage your hackathon, review participants, and track progress from your dashboard. Please keep this email for your records.</p>
  `),
});



// New Hackathon Notification Email
export const newHackathonEmail = (name: string, hackathonTitle: string, organizerName: string, startDate: string, endDate: string) => ({
  subject: `New Hackathon Alert: ${hackathonTitle}`,
  html: base(`
    <h2 style="color:#3b82f6;font-size:24px;margin:0 0 24px 0;font-weight:bold;">New Hackathon Available! 🚀</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">A new hackathon has been created by <strong style="color:#60a5fa;">${organizerName}</strong>!</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #3b82f6;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">${hackathonTitle}</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Organizer:</strong> ${organizerName}</p>
        <p style="margin:0 0 8px 0;"><strong>Start Date:</strong> ${startDate}</p>
        <p style="margin:0 0 8px 0;"><strong>End Date:</strong> ${endDate}</p>
      </div>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/explore" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">View Hackathon</a>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Don't miss this opportunity to showcase your skills and win amazing prizes!</p>
  `),
});

// Participant Registration Success Email
export const participantRegistrationEmail = (name: string, hackathonTitle: string, startDate: string, submissionDeadline: string) => ({
  subject: `Registration Confirmed: ${hackathonTitle}`,
  html: base(`
    <h2 style="color:#10b981;font-size:24px;margin:0 0 24px 0;font-weight:bold;">You're Registered! 🎉</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">You have successfully registered for <strong style="color:#60a5fa;">${hackathonTitle}</strong>!</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #10b981;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Important Dates</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Hackathon Starts:</strong> ${startDate}</p>
        <p style="margin:0 0 8px 0;"><strong>Submission Deadline:</strong> ${submissionDeadline}</p>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="color:white;margin:0;font-size:16px;font-weight:bold;">Get ready to build something amazing! 💪</p>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Start preparing your ideas and team. We can't wait to see what you create!</p>
  `),
});

// Submission Deadline Reminder Email
export const deadlineReminderEmail = (name: string, hackathonTitle: string, daysLeft: number, submissionDeadline: string) => ({
  subject: `⏰ ${daysLeft} Day${daysLeft > 1 ? 's' : ''} Left: ${hackathonTitle}`,
  html: base(`
    <h2 style="color:#f59e0b;font-size:24px;margin:0 0 24px 0;font-weight:bold;">Deadline Approaching! ⏰</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">This is a friendly reminder that the submission deadline for <strong style="color:#60a5fa;">${hackathonTitle}</strong> is approaching!</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #f59e0b;">
      <h3 style="color:#f59e0b;margin:0 0 16px 0;font-size:24px;text-align:center;">${daysLeft} Day${daysLeft > 1 ? 's' : ''} Remaining</h3>
      <p style="color:#cbd5e1;margin:0;text-align:center;"><strong>Deadline:</strong> ${submissionDeadline}</p>
    </div>
    
    <div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="color:white;margin:0;font-size:16px;font-weight:bold;">Don't miss out! Submit your project soon! 🚀</p>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Submit Now</a>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Make sure to submit your project before the deadline to be eligible for prizes!</p>
  `),
});

// Host Notification: New Participant
export const hostNewParticipantEmail = (hostName: string, hackathonTitle: string, participantName: string, participantEmail: string) => ({
  subject: `New Participant: ${participantName} joined ${hackathonTitle}`,
  html: base(`
    <h2 style="color:#3b82f6;font-size:24px;margin:0 0 24px 0;font-weight:bold;">New Participant Registered! 👥</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${hostName}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">Great news! A new participant has registered for your hackathon.</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #3b82f6;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Participant Details</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${participantName}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${participantEmail}</p>
        <p style="margin:0 0 8px 0;"><strong>Hackathon:</strong> ${hackathonTitle}</p>
      </div>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">View Dashboard</a>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Your hackathon is growing! Keep engaging with your participants.</p>
  `),
});

// Host Notification: New Submission
export const hostNewSubmissionEmail = (hostName: string, hackathonTitle: string, participantName: string, projectTitle: string) => ({
  subject: `New Submission: ${projectTitle} - ${hackathonTitle}`,
  html: base(`
    <h2 style="color:#10b981;font-size:24px;margin:0 0 24px 0;font-weight:bold;">New Project Submitted! 📝</h2>
    <p style="font-size:16px;margin:0 0 16px 0;">Hi <strong>${hostName}</strong>,</p>
    <p style="font-size:16px;margin:0 0 24px 0;">A participant has submitted their project for <strong style="color:#60a5fa;">${hackathonTitle}</strong>!</p>
    
    <div style="background-color:#1e293b;border-radius:8px;padding:24px;margin:24px 0;border-left:4px solid #10b981;">
      <h3 style="color:#f1f5f9;margin:0 0 16px 0;font-size:18px;">Submission Details</h3>
      <div style="color:#cbd5e1;">
        <p style="margin:0 0 8px 0;"><strong>Participant:</strong> ${participantName}</p>
        <p style="margin:0 0 8px 0;"><strong>Project:</strong> ${projectTitle}</p>
        <p style="margin:0 0 8px 0;"><strong>Hackathon:</strong> ${hackathonTitle}</p>
      </div>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Review Submission</a>
    </div>
    
    <p style="font-size:16px;margin:24px 0 0 0;">Review the submission and provide feedback to help participants improve!</p>
  `),
});
