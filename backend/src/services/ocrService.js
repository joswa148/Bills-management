/**
 * OCR Service — Production-Ready, Mindee-First Architecture
 *
 * Strategy:
 *   • If MINDEE_API_KEY env var is set → calls real Mindee InvoiceV4 parser
 *   • If not set              → enhanced mock that returns the SAME data shape
 *
 * Response contract (always consistent, both paths):
 * {
 *   invoiceId, serviceName, amountDue, items[], ... (flat fields)
 *   _confidence: { invoiceIdNumber: 0.97, serviceName: 0.92, ... }
 *   _meta:       { overallConfidence, provider, fieldsExtracted, processedAt }
 * }
 */

import path from 'path';
import fs from 'fs/promises';

// ─────────────────────────────────────────────────────────────
// MINDEE NORMALIZER
// Maps Mindee InvoiceV4 prediction → our flat schema
// ─────────────────────────────────────────────────────────────
const normalizeMindeeResponse = (prediction) => {
  const get = (field) => ({
    value: field?.value ?? null,
    confidence: typeof field?.confidence === 'number' ? field.confidence : 0
  });

  const invoiceId   = get(prediction.invoiceNumber);
  const supplierName = get(prediction.supplierName);
  const totalAmount  = get(prediction.totalAmount);
  const totalNet     = get(prediction.totalNet);
  const issueDate    = get(prediction.date);
  const dueDate      = get(prediction.dueDate);
  const supplierAddr = get(prediction.supplierAddress);
  const customerName = get(prediction.customerName);
  const customerAddr = get(prediction.customerAddress);

  const clientAddressStr = [customerName.value, customerAddr.value]
    .filter(Boolean).join('\n');

  const items = (prediction.lineItems || []).map(item => ({
    description: item.description || '',
    quantity:    Number(item.quantity)   || 1,
    unitPrice:   Number(item.unitPrice)  || 0,
    amount:      Number(item.totalAmount) || (Number(item.quantity) * Number(item.unitPrice)) || 0,
  }));

  const confidence = {
    invoiceIdNumber: invoiceId.confidence,
    serviceName:     supplierName.confidence,
    amountDue:       totalAmount.confidence,
    subtotal:        totalNet.confidence,
    issueDate:       issueDate.confidence,
    dueDate:         dueDate.confidence,
    senderAddress:   supplierAddr.confidence,
    clientAddress:   Math.max(customerName.confidence, customerAddr.confidence),
  };

  const confValues = Object.values(confidence).filter(v => v > 0);
  const overallConfidence = confValues.length > 0
    ? Math.round((confValues.reduce((s, v) => s + v, 0) / confValues.length) * 100) / 100
    : 0;

  return {
    invoiceId:     invoiceId.value,
    serviceName:   supplierName.value || 'Unknown Vendor',
    category:      'General',
    period:        'monthly',
    senderAddress: supplierAddr.value || '',
    clientAddress: clientAddressStr,
    subject:       '',
    issueDate:     issueDate.value || new Date().toISOString().split('T')[0],
    dueDate:       dueDate.value   || null,
    poNumber:      (prediction.referenceNumbers?.[0]?.value) || null,
    subtotal:      Number(totalNet.value)    || Number(totalAmount.value) || 0,
    discount:      0,
    amountDue:     Number(totalAmount.value) || 0,
    currency:      prediction.locale?.currency || 'INR',
    paymentMethod: '',
    bankName:      '',
    cardLast4:     null,
    region:        'India',
    status:        'active',
    notes:         '',
    items,
    _confidence: confidence,
    _meta: {
      overallConfidence,
      provider:        'mindee',
      fieldsExtracted: Object.keys(confidence).length,
      processedAt:     new Date().toISOString(),
    },
  };
};

// ─────────────────────────────────────────────────────────────
// MINDEE PROVIDER
// Dynamic import keeps the app from crashing if mindee isn't installed
// ─────────────────────────────────────────────────────────────
const extractWithMindee = async (filePath) => {
  const mindee = await import('mindee').catch(() => {
    throw new Error('Mindee package not installed. Run: npm install mindee');
  });
  const client      = new mindee.Client({ apiKey: process.env.MINDEE_API_KEY });
  const inputSource = client.docFromPath(filePath);
  const response    = await client.parse(mindee.product.InvoiceV4, inputSource);
  return normalizeMindeeResponse(response.document.inference.prediction);
};

// ─────────────────────────────────────────────────────────────
// MOCK PROVIDER
// Returns identical shape to Mindee path, including _confidence + _meta
// ─────────────────────────────────────────────────────────────
const extractWithMock = async (filePath) => {
  const fileName = path.basename(filePath).toLowerCase();
  await new Promise(resolve => setTimeout(resolve, 2500)); // simulate AI delay

  const today   = new Date();
  const due     = new Date(today); due.setDate(due.getDate() + 30);
  const fmt     = (d) => d.toISOString().split('T')[0];
  const randInv = (prefix) => `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`;

  let serviceData = null;

  // ── Known service detection ──────────────────────────────
  if (fileName.includes('netflix')) {
    serviceData = {
      invoiceId:     randInv('NET'),
      serviceName:   'Netflix',
      category:      'Entertainment',
      senderAddress: 'Netflix Inc.\n100 Winchester Circle\nLos Gatos, CA 95032\nUSA',
      subject:       'Netflix Premium Subscription',
      items:         [{ description: 'Netflix Premium (Ultra HD, 4 screens)', quantity: 1, unitPrice: 649, amount: 649 }],
      subtotal: 649, discount: 0, amountDue: 649, currency: 'INR',
      paymentMethod: 'Credit Card', bankName: 'HDFC Bank', cardLast4: '1234',
      _confidence: { invoiceIdNumber: 0.91, serviceName: 0.98, amountDue: 0.99, subtotal: 0.99, issueDate: 0.95, dueDate: 0.90, senderAddress: 0.88, clientAddress: 0 },
    };
  } else if (fileName.includes('aws') || fileName.includes('amazon')) {
    serviceData = {
      invoiceId:     randInv('AWS'),
      serviceName:   'AWS Cloud Services',
      category:      'Infrastructure',
      senderAddress: 'Amazon Web Services, Inc.\n410 Terry Ave N\nSeattle, WA 98109\nUSA',
      subject:       'AWS Monthly Usage Invoice',
      items: [
        { description: 'Amazon EC2 - t3.medium (730 hrs)', quantity: 730, unitPrice: 14.79, amount: 10796.70 },
        { description: 'Amazon S3 Storage (500 GB)',        quantity: 500, unitPrice: 2.30,  amount: 1150    },
        { description: 'Data Transfer Out',                 quantity: 100, unitPrice: 5.53,  amount: 553.30  },
      ],
      subtotal: 12500, discount: 0, amountDue: 12500, currency: 'INR',
      paymentMethod: 'Bank Transfer', bankName: 'ICICI Bank',
      _confidence: { invoiceIdNumber: 0.94, serviceName: 0.99, amountDue: 0.97, subtotal: 0.97, issueDate: 0.96, dueDate: 0.92, senderAddress: 0.93, clientAddress: 0 },
    };
  } else if (fileName.includes('google') || fileName.includes('workspace') || fileName.includes('gws')) {
    serviceData = {
      invoiceId:     randInv('GWS'),
      serviceName:   'Google Workspace',
      category:      'Productivity',
      senderAddress: 'Google LLC\n1600 Amphitheatre Parkway\nMountain View, CA 94043\nUSA',
      subject:       'Google Workspace Business Subscription',
      items:         [{ description: 'Business Starter - 10 users × ₹140/user', quantity: 10, unitPrice: 140, amount: 1400 }],
      subtotal: 1400, discount: 0, amountDue: 1400, currency: 'INR',
      paymentMethod: 'Credit Card', bankName: 'Axis Bank', cardLast4: '9012',
      _confidence: { invoiceIdNumber: 0.92, serviceName: 0.99, amountDue: 0.98, subtotal: 0.98, issueDate: 0.94, dueDate: 0.91, senderAddress: 0.91, clientAddress: 0 },
    };
  } else if (fileName.includes('spotify')) {
    serviceData = {
      invoiceId:     randInv('SPT'),
      serviceName:   'Spotify Premium',
      category:      'Entertainment',
      senderAddress: 'Spotify AB\nMaster Samuelsgatan 1\nStockholm 111 44\nSweden',
      subject:       'Spotify Premium Family Plan',
      items:         [{ description: 'Premium Family Plan (up to 6 accounts)', quantity: 1, unitPrice: 119, amount: 119 }],
      subtotal: 119, discount: 0, amountDue: 119, currency: 'INR',
      paymentMethod: 'UPI', bankName: 'SBI',
      _confidence: { invoiceIdNumber: 0.90, serviceName: 0.98, amountDue: 0.99, subtotal: 0.99, issueDate: 0.93, dueDate: 0.89, senderAddress: 0.87, clientAddress: 0 },
    };
  } else if (fileName.includes('harvest')) {
    serviceData = {
      invoiceId:     randInv('INV'),
      serviceName:   'Harvest Services',
      category:      'Software',
      senderAddress: 'Harvest Inc.\n123 Creative Way\nSan Francisco, CA 94103\nUSA',
      clientAddress: 'Joswa Solutions\n456 Tech Park\nBangalore, KA 560001\nIndia',
      subject:       'Monthly Web Development & Consulting Services',
      poNumber:      randInv('PO'),
      items: [
        { description: 'Web Development (Senior Developer)', quantity: 40, unitPrice: 25,  amount: 1000   },
        { description: 'Project Management & Consulting',    quantity: 5,  unitPrice: 50,  amount: 250    },
      ],
      subtotal: 1250, discount: 312.50, amountDue: 937.50, currency: 'INR',
      paymentMethod: 'Bank Transfer', bankName: 'HDFC Bank',
      notes: 'Thank you for your business. Payment due within 30 days.',
      _confidence: { invoiceIdNumber: 0.96, serviceName: 0.97, amountDue: 0.98, subtotal: 0.98, discount: 0.95, issueDate: 0.97, dueDate: 0.95, senderAddress: 0.96, clientAddress: 0.94 },
    };
  } else {
    // ── Generic fallback — always returns complete invoice ──
    const randomAmount = Math.floor(Math.random() * 4000) + 1000;
    const extractedName = path.basename(filePath, path.extname(filePath))
      .replace(/[-_]/g, ' ')
      .replace(/\d{10,}/g, '')
      .replace(/(invoice|bill|receipt|statement|scan|document|copy)/gi, '')
      .trim().split(' ').filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'New Service';

    serviceData = {
      invoiceId:     randInv('INV'),
      serviceName:   extractedName,
      category:      'General',
      senderAddress: `${extractedName}\n123 Business Street\nMumbai, MH 400001\nIndia`,
      subject:       `Invoice for ${extractedName}`,
      items:         [{ description: `${extractedName} — Monthly Plan`, quantity: 1, unitPrice: randomAmount, amount: randomAmount }],
      subtotal: randomAmount, discount: 0, amountDue: randomAmount, currency: 'INR',
      paymentMethod: 'Credit Card', bankName: 'HDFC Bank',
      // Lower confidence for generic extraction — user should review
      _confidence: { invoiceIdNumber: 0.72, serviceName: 0.65, amountDue: 0.71, subtotal: 0.71, issueDate: 0.80, dueDate: 0.75, senderAddress: 0.60, clientAddress: 0 },
    };
  }

  // Merge with common defaults
  const merged = {
    period:        'monthly',
    clientAddress: '',
    poNumber:      null,
    cardLast4:     null,
    region:        'India',
    status:        'active',
    notes:         '',
    issueDate:     fmt(today),
    dueDate:       fmt(due),
    ...serviceData,
  };

  // Compute overall confidence
  const confValues = Object.values(merged._confidence).filter(v => v > 0);
  const overallConfidence = confValues.length > 0
    ? Math.round((confValues.reduce((s, v) => s + v, 0) / confValues.length) * 100) / 100
    : 0;

  return {
    ...merged,
    _meta: {
      overallConfidence,
      provider:        'mock',
      fieldsExtracted: confValues.length,
      processedAt:     new Date().toISOString(),
    },
  };
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — Provider selection with automatic fallback
// ─────────────────────────────────────────────────────────────
export const extractSubscriptionData = async (filePath) => {
  if (process.env.MINDEE_API_KEY && process.env.MINDEE_API_KEY !== 'your_mindee_api_key') {
    try {
      console.log('[OCR] Using Mindee API for extraction...');
      return await extractWithMindee(filePath);
    } catch (err) {
      console.warn('[OCR] Mindee failed, falling back to mock:', err.message);
    }
  }
  console.log('[OCR] Using enhanced mock provider...');
  return await extractWithMock(filePath);
};
