import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { getUserNotifications, checkAndCreateNotifications } from '../services/notificationService.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/read', notificationController.markRead);

router.post('/check', async (req, res) => {
  try {
    // Only admins should ideally trigger this, but for now we allow anyone for testing
    const notifications = await checkAndCreateNotifications();
    res.json({ message: 'Check completed', count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manual trigger for admin only
router.post('/send-reminders', restrictTo('admin'), notificationController.triggerCheck);

export default router;
