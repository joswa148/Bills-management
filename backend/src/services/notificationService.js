import { pool } from '../config/database.js';
import { differenceInDays } from 'date-fns';
import crypto from 'crypto';
import { sendExpiryAlert, sendInvoiceConfirmation } from './emailService.js';

export const checkAndCreateNotifications = async () => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  
  // Find all active subscriptions and their user details
  const [subscriptions] = await pool.execute(
    `SELECT s.*, u.email, u.name as user_name 
     FROM subscriptions s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.status = "active"`
  );

  const notifications = [];

  for (const sub of subscriptions) {
    // FIX: use next_billing_date instead of validity_date to match schema
    const daysLeft = differenceInDays(new Date(sub.next_billing_date), new Date());
    
    // Create notification if due in 7, 3, or 1 days
    if (daysLeft >= 0 && (daysLeft === 7 || daysLeft === 3 || daysLeft === 1)) {
      const [existing] = await pool.execute(
        'SELECT * FROM notifications WHERE subscription_id = ? AND type = ? AND DATE(sent_at) = CURDATE()',
        [sub.id, daysLeft <= 2 ? 'overdue' : 'upcoming_bill']
      );

      if (existing.length === 0) {
        const id = crypto.randomUUID();
        const type = daysLeft <= 2 ? 'overdue' : 'upcoming_bill';
        const message = `${sub.service_name} is due for renewal in ${daysLeft} days.`;

        // Send email alert
        let emailSent = false;
        try {
          await sendExpiryAlert(sub.email, sub.user_name, sub.service_name, daysLeft);
          emailSent = true;
        } catch (error) {
          console.error(`Failed to send email to ${sub.email}:`, error);
        }

        await pool.execute(
          'INSERT INTO notifications (id, user_id, subscription_id, type, message, email_sent) VALUES (?, ?, ?, ?, ?, ?)',
          [id, sub.user_id, sub.id, type, message, emailSent]
        );

        notifications.push({ id, userId: sub.user_id, subscriptionId: sub.id, type, message, emailSent });
      }
    }
  }

  return notifications;
};

export const getUserNotifications = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY sent_at DESC',
    [userId]
  );
  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    subscriptionId: row.subscription_id,
    type: row.type,
    message: row.message,
    isRead: row.is_read,
    sentAt: row.sent_at,
    emailSent: row.email_sent
  }));
};

export const markAsRead = async (id, userId) => {
  await pool.execute(
    'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return true;
};

export const createInvoiceNotification = async (userId, invoiceData) => {
  const { serviceName, invoiceId, amountDue, currency, status } = invoiceData;
  const id = crypto.randomUUID();
  const type = 'invoice_processed';
  const message = `Invoice ${invoiceId} for ${serviceName} has been processed: ${currency} ${amountDue}.`;

  // Get user details for email
  const [user] = await pool.execute('SELECT email, name FROM users WHERE id = ?', [userId]);
  
  let emailSent = false;
  if (user.length > 0) {
    try {
      await sendInvoiceConfirmation(user[0].email, user[0].name, invoiceData);
      emailSent = true;
    } catch (error) {
      console.error(`Failed to send invoice email to ${user[0].email}:`, error);
    }
  }

  await pool.execute(
    'INSERT INTO notifications (id, user_id, type, message, email_sent) VALUES (?, ?, ?, ?, ?)',
    [id, userId, type, message, emailSent]
  );

  return { id, message, emailSent };
};
