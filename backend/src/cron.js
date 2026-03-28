import cron from 'node-cron';
import * as notificationService from './services/notificationService.js';

export const initCronJobs = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily renewal check...');
    try {
      const created = await notificationService.checkAndCreateNotifications();
      console.log(`✅ Created ${created.length} renewal notifications.`);
    } catch (error) {
      console.error('❌ Error running renewal check:', error);
    }
  });
};
