import * as subscriptionService from '../services/subscriptionService.js';
import { z } from 'zod';

const subscriptionSchema = z.object({
  serviceName: z.string().min(1),
  invoiceId: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  category: z.string().optional(),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  priceINR: z.number(),
  priceAED: z.number(),
  subtotal: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  amountDue: z.number().optional().nullable(),
  validityDate: z.string(),
  issueDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  poNumber: z.string().optional().nullable(),
  paymentMethod: z.string(),
  bankName: z.string(),
  region: z.enum(['India', 'UAE']),
  status: z.enum(['active', 'cancelled', 'paused']),
  notes: z.string().optional(),
});

export const listSubscriptions = async (req, res, next) => {
  try {
    const filters = req.query;
    const subscriptions = await subscriptionService.getAllSubscriptions(req.user.id, filters);
    res.status(200).json({ status: 'success', data: { subscriptions } });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', data: { subscription } });
  } catch (error) {
    next(error);
  }
};

export const addSubscription = async (req, res, next) => {
  try {
    const validatedData = subscriptionSchema.parse(req.body);
    const subscription = await subscriptionService.createSubscription(req.user.id, validatedData);
    res.status(201).json({ status: 'success', data: { subscription } });
  } catch (error) {
    next(error);
  }
};

export const editSubscription = async (req, res, next) => {
  try {
    const validatedData = subscriptionSchema.partial().parse(req.body);
    const subscription = await subscriptionService.updateSubscription(req.params.id, req.user.id, validatedData);
    res.status(200).json({ status: 'success', data: { subscription } });
  } catch (error) {
    next(error);
  }
};

export const removeSubscription = async (req, res, next) => {
  try {
    await subscriptionService.deleteSubscription(req.params.id, req.user.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
