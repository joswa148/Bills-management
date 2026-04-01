import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.handleRegister);
router.post('/login', authController.handleLogin);

// Protected routes
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, authController.updateMe);

export default router;
