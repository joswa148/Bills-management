import { prisma } from '../app.js';
import { differenceInDays } from 'date-fns';

export const checkAndCreateNotifications = async () => {
  const today = new Date();
  
  // Find all active subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'active' },
  });

  const notifications = [];

  for (const sub of subscriptions) {
    const daysLeft = differenceInDays(new Date(sub.validityDate), today);
    
    // Create notification if due in 7 days
    if (daysLeft >= 0 && daysLeft <= 7) {
      // Check if notification already exists for this sub and this date (simple check)
      const existing = await prisma.notification.findFirst({
        where: {
          subscriptionId: sub.id,
          sentAt: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
          },
        },
      });

      if (!existing) {
        const notification = await prisma.notification.create({
          data: {
            userId: sub.userId,
            subscriptionId: sub.id,
            type: daysLeft <= 2 ? 'overdue' : 'upcoming_bill',
            message: `${sub.serviceName} is due for renewal in ${daysLeft} days.`,
          },
        });
        notifications.push(notification);
        // Here you would also call an email service
      }
    }
  }

  return notifications;
};

export const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { sentAt: 'desc' },
  });
};

export const markAsRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};
