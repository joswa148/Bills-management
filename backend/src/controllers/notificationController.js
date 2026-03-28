import * as notificationService from '../services/notificationService.js';

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.status(200).json({ status: 'success', data: { notifications } });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const triggerCheck = async (req, res, next) => {
  try {
    const created = await notificationService.checkAndCreateNotifications();
    res.status(200).json({ status: 'success', data: { created: created.length } });
  } catch (error) {
    next(error);
  }
};
