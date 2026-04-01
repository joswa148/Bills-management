import express from 'express';
import * as statsController from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/scanner', statsController.getScannerStats);

export default router;
