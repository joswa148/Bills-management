import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', notificationController.listNotifications);
router.put('/:id/read', notificationController.markRead);

// Manual trigger for admin only
router.post('/send-reminders', restrictTo('admin'), notificationController.triggerCheck);

export default router;
