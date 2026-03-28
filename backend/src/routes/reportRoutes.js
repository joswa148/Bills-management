import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', reportController.getDashboardSummary);
router.get('/spending', reportController.getSpendingByCategory);

export default router;
