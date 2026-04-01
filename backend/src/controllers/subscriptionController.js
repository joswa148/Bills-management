import * as subscriptionService from '../services/subscriptionService.js';
import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().default(1),
  unitPrice: z.number().optional().nullable(),
  unit_price: z.number().optional().nullable(),
  amount: z.number()
});

const billingSchema = z.object({
  serviceName: z.string().min(1),
  category: z.string().optional(),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  senderAddress: z.string().optional().nullable(),
  clientAddress: z.string().optional().nullable(),
  invoiceIdNumber: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  issueDate: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  poNumber: z.string().optional().nullable(),
  subtotal: z.number(),
  discount: z.number().optional().nullable(),
  amountDue: z.number(),
  currency: z.string().default('INR'),
  paymentMethod: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  cardLast4: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).optional().nullable(),
  region: z.enum(['India', 'UAE']).optional()
});

export const listSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions(req.user.id);
    res.status(200).json({ status: 'success', data: { subscriptions } });
  } catch (error) {
    next(error);
  }
};

export const addSubscription = async (req, res, next) => {
  try {
    const validatedData = billingSchema.parse(req.body);
    
    // Normalize and Map camelCase to snake_case for the service layer
    const processData = {
      ...validatedData,
      invoice_id_number: validatedData.invoiceIdNumber,
      sender_address: validatedData.senderAddress,
      client_address: validatedData.clientAddress,
      issue_date: validatedData.issueDate,
      due_date: validatedData.dueDate,
      po_number: validatedData.poNumber,
      amount_due: validatedData.amountDue,
      payment_method: validatedData.paymentMethod,
      card_last4: validatedData.cardLast4,
      bank_name: validatedData.bankName,
      // Ensure nested items also have a unified unitPrice for the service
      items: (validatedData.items || []).map(item => ({
        ...item,
        unitPrice: item.unitPrice || item.unit_price || 0
      }))
    };

    const result = await subscriptionService.processInvoice(req.user.id, processData);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const listInvoices = async (req, res, next) => {
  try {
    const invoices = await subscriptionService.getAllInvoices(req.user.id);
    res.status(200).json({ status: 'success', data: { invoices } });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const invoice = await subscriptionService.getInvoiceDetails(req.params.id, req.user.id);
    if (!invoice) return res.status(404).json({ status: 'error', message: 'Invoice not found' });
    res.status(200).json({ status: 'success', data: { invoice } });
  } catch (error) {
    next(error);
  }
};

export const editSubscription = async (req, res, next) => {
  try {
    res.status(501).json({ status: 'error', message: 'Use addSubscription to process new invoices' });
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

export const mapVendorAlias = async (req, res, next) => {
  try {
    const { rawName, canonicalName } = req.body;
    if (!rawName || !canonicalName) {
      return res.status(400).json({ status: 'error', message: 'rawName and canonicalName required' });
    }
    await subscriptionService.addVendorMapping(rawName, canonicalName);
    res.status(200).json({ status: 'success', message: 'Vendor mapping saved' });
  } catch (error) {
    next(error);
  }
};
