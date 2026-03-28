import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.handleRegister);
router.post('/login', authController.handleLogin);

export default router;
