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

export const sendInvoiceConfirmation = async (userEmail, userName, invoiceData) => {
  const { serviceName, invoiceId, amountDue, currency, status } = invoiceData;
  const subject = `Invoice Processed: ${serviceName} (${invoiceId})`;
  
  const text = `Hi ${userName},\n\nYour invoice for ${serviceName} has been successfully processed.\n\nInvoice ID: ${invoiceId}\nAmount Due: ${currency} ${amountDue}\nStatus: ${status}\n\nYou can view the full details on your dashboard.\n\nBest regards,\nBills Management Team`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h2 style="margin: 0;">Invoice Processed</h2>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p style="font-size: 16px;">Hi <strong>${userName}</strong>,</p>
        <p>Your invoice for <strong>${serviceName}</strong> has been successfully processed and recorded.</p>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #64748b;">Invoice ID</td><td style="text-align: right; font-weight: bold;">${invoiceId}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Amount Due</td><td style="text-align: right; font-weight: bold; color: #3b82f6;">${currency} ${amountDue}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Status</td><td style="text-align: right;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${status}</span></td></tr>
          </table>
        </div>

        <p>Log in to your dashboard to view the full details and download the original copy.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}" style="display: block; width: 200px; background: #3b82f6; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 30px auto;">View Dashboard</a>
      </div>
      <hr style="border: none; border-top: 1px solid #f1f5f9;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Best regards,<br>Bills Management Team</p>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
};
