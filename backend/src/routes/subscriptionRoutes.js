import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.get('/', subscriptionController.listSubscriptions);
router.get('/:id', subscriptionController.getSubscription);
router.post('/', subscriptionController.addSubscription);
router.put('/:id', subscriptionController.editSubscription);
router.delete('/:id', subscriptionController.removeSubscription);

export default router;
