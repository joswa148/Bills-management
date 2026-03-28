import { pool } from '../app.js';
import { differenceInDays } from 'date-fns';
import crypto from 'crypto';

export const checkAndCreateNotifications = async () => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  
  // Find all active subscriptions
  const [subscriptions] = await pool.execute('SELECT * FROM subscriptions WHERE status = "active"');

  const notifications = [];

  for (const sub of subscriptions) {
    const daysLeft = differenceInDays(new Date(sub.validity_date), new Date());
    
    // Create notification if due in 7 days
    if (daysLeft >= 0 && daysLeft <= 7) {
      const [existing] = await pool.execute(
        'SELECT * FROM notifications WHERE subscription_id = ? AND sent_at >= ?',
        [sub.id, startOfToday]
      );

      if (existing.length === 0) {
        const id = crypto.randomUUID();
        const type = daysLeft <= 2 ? 'overdue' : 'upcoming_bill';
        const message = `${sub.service_name} is due for renewal in ${daysLeft} days.`;

        await pool.execute(
          'INSERT INTO notifications (id, user_id, subscription_id, type, message) VALUES (?, ?, ?, ?, ?)',
          [id, sub.user_id, sub.id, type, message]
        );

        notifications.push({ id, userId: sub.user_id, subscriptionId: sub.id, type, message });
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
