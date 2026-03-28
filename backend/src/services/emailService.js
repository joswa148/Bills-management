import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  // If credentials are still default, just log to console
  if (process.env.SMTP_USER === 'your-email@gmail.com' || !process.env.SMTP_USER) {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log('-----------------------');
    return { messageId: 'mock-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendExpiryAlert = async (userEmail, userName, serviceName, daysLeft) => {
  const subject = `Resubscribe Alert: ${serviceName} expires in ${daysLeft} days`;
  const text = `Hi ${userName},\n\nThis is a friendly reminder that your subscription for ${serviceName} will expire in ${daysLeft} days.\n\nPlease log in to the dashboard to manage your subscriptions.\n\nBest regards,\nBills Management Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ff9800;">Resubscribe Alert</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>This is a friendly reminder that your subscription for <strong>${serviceName}</strong> will expire in <span style="color: red; font-weight: bold;">${daysLeft} days</span>.</p>
      <p>Please log in to the dashboard to manage your subscriptions and ensure uninterrupted service.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888;">Best regards,<br>Bills Management Team</p>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
};
