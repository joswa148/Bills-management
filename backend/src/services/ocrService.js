import fs from 'fs/promises';
import path from 'path';

/**
 * Mock OCR service to simulate extraction of data from bill images/PDFs.
 * In production, this would call AWS Textract, Google Document AI, etc.
 * 
 * HOW IT WORKS:
 * 1. Tries to detect the service from filename keywords
 * 2. Falls back to a rich generic invoice so the form is always fully populated
 */
export const extractSubscriptionData = async (filePath) => {
  const fileName = path.basename(filePath).toLowerCase();

  // Simulate realistic AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  const fmt = (d) => d.toISOString().split('T')[0];

  // ─── SPECIFIC SERVICE DETECTION ───────────────────────────────────────────

  if (fileName.includes('netflix')) {
    return {
      serviceName: 'Netflix',
      category: 'Entertainment',
      period: 'monthly',
      invoiceId: 'NET-' + Math.floor(Math.random() * 100000),
      subject: 'Netflix Premium Subscription',
      senderAddress: 'Netflix Inc.\n100 Winchester Circle\nLos Gatos, CA 95032\nUSA',
      clientAddress: '',
      items: [
        { description: 'Netflix Premium (Ultra HD, 4 screens)', quantity: 1, unitPrice: 649, amount: 649 }
      ],
      subtotal: 649,
      discount: 0,
      amountDue: 649,
      currency: 'INR',
      issueDate: fmt(today),
      dueDate: fmt(dueDate),
      poNumber: null,
      paymentMethod: 'Credit Card',
      bankName: 'HDFC Bank',
      cardLast4: '1234',
      region: 'India',
      status: 'active',
      notes: 'Thank you for subscribing to Netflix.'
    };
  }

  if (fileName.includes('aws') || fileName.includes('amazon')) {
    return {
      serviceName: 'AWS Cloud Services',
      category: 'Infrastructure',
      period: 'monthly',
      invoiceId: 'AWS-' + Math.floor(Math.random() * 100000),
      subject: 'AWS Monthly Usage Invoice',
      senderAddress: 'Amazon Web Services, Inc.\n410 Terry Ave N\nSeattle, WA 98109\nUSA',
      clientAddress: '',
      items: [
        { description: 'Amazon EC2 - t3.medium (730 hrs)', quantity: 730, unitPrice: 14.79, amount: 10796.70 },
        { description: 'Amazon S3 Storage (500 GB)', quantity: 500, unitPrice: 2.30, amount: 1150 },
        { description: 'Data Transfer Out', quantity: 100, unitPrice: 5.53, amount: 553.30 }
      ],
      subtotal: 12500,
      discount: 0,
      amountDue: 12500,
      currency: 'INR',
      issueDate: fmt(today),
      dueDate: fmt(dueDate),
      poNumber: 'AWS-PO-' + Math.floor(Math.random() * 9000),
      paymentMethod: 'Bank Transfer',
      bankName: 'ICICI Bank',
      cardLast4: null,
      region: 'India',
      status: 'active',
      notes: 'AWS invoice for the current billing cycle.'
    };
  }

  if (fileName.includes('google') || fileName.includes('workspace') || fileName.includes('gws')) {
    return {
      serviceName: 'Google Workspace',
      category: 'Productivity',
      period: 'monthly',
      invoiceId: 'GWS-' + Math.floor(Math.random() * 100000),
      subject: 'Google Workspace Business Subscription',
      senderAddress: 'Google LLC\n1600 Amphitheatre Parkway\nMountain View, CA 94043\nUSA',
      clientAddress: '',
      items: [
        { description: 'Business Starter - 10 users x ₹140/user', quantity: 10, unitPrice: 140, amount: 1400 }
      ],
      subtotal: 1400,
      discount: 0,
      amountDue: 1400,
      currency: 'INR',
      issueDate: fmt(today),
      dueDate: fmt(dueDate),
      poNumber: null,
      paymentMethod: 'Credit Card',
      bankName: 'Axis Bank',
      cardLast4: '9012',
      region: 'India',
      status: 'active',
      notes: ''
    };
  }

  if (fileName.includes('spotify')) {
    return {
      serviceName: 'Spotify Premium',
      category: 'Entertainment',
      period: 'monthly',
      invoiceId: 'SPT-' + Math.floor(Math.random() * 100000),
      subject: 'Spotify Premium Family Plan',
      senderAddress: 'Spotify AB\nMaster Samuelsgatan 1\nStockholm 111 44\nSweden',
      clientAddress: '',
      items: [
        { description: 'Premium Family Plan (up to 6 accounts)', quantity: 1, unitPrice: 119, amount: 119 }
      ],
      subtotal: 119,
      discount: 0,
      amountDue: 119,
      currency: 'INR',
      issueDate: fmt(today),
      dueDate: fmt(dueDate),
      poNumber: null,
      paymentMethod: 'UPI',
      bankName: 'SBI',
      cardLast4: null,
      region: 'India',
      status: 'active',
      notes: ''
    };
  }

  if (fileName.includes('harvest')) {
    return {
      serviceName: 'Harvest Services',
      category: 'Software',
      period: 'monthly',
      invoiceId: 'INV-' + Math.floor(Math.random() * 100000),
      subject: 'Monthly Web Development & Consulting Services',
      senderAddress: 'Harvest Inc.\n123 Creative Way\nSan Francisco, CA 94103\nUSA',
      clientAddress: 'Joswa Solutions\n456 Tech Park\nBangalore, KA 560001\nIndia',
      items: [
        { description: 'Web Development (Senior Developer)', quantity: 40, unitPrice: 25, amount: 1000 },
        { description: 'Project Management & Consulting', quantity: 5, unitPrice: 50, amount: 250 }
      ],
      subtotal: 1250,
      discount: 312.50,
      amountDue: 937.50,
      currency: 'INR',
      issueDate: fmt(today),
      dueDate: fmt(dueDate),
      poNumber: 'PO-' + Math.floor(Math.random() * 9000),
      paymentMethod: 'Bank Transfer',
      bankName: 'HDFC Bank',
      cardLast4: null,
      region: 'India',
      status: 'active',
      notes: 'Thank you for your business. Payment due within 30 days.'
    };
  }

  // ─── GENERIC FALLBACK — always returns a fully-populated invoice ──────────
  // This ensures ANY file upload fills the form with meaningful demo data.
  const randomInvoiceNum = Math.floor(Math.random() * 90000) + 10000;
  const randomAmount = Math.floor(Math.random() * 4000) + 1000; // between 1000-5000

  // Try to extract a service name from the filename
  let serviceName = path.basename(filePath, path.extname(filePath))
    .replace(/[-_]/g, ' ')
    .replace(/\d{10,}/g, '') // remove timestamps
    .replace(/(invoice|bill|receipt|statement|scan|document|copy)/gi, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || 'Subscription Service';

  return {
    serviceName,
    category: 'General',
    period: 'monthly',
    invoiceId: 'INV-' + randomInvoiceNum,
    subject: `Invoice for ${serviceName}`,
    senderAddress: `${serviceName}\n123 Business Street\nMumbai, MH 400001\nIndia`,
    clientAddress: '',
    items: [
      { description: `${serviceName} - Monthly Plan`, quantity: 1, unitPrice: randomAmount, amount: randomAmount }
    ],
    subtotal: randomAmount,
    discount: 0,
    amountDue: randomAmount,
    currency: 'INR',
    issueDate: fmt(today),
    dueDate: fmt(dueDate),
    poNumber: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
    paymentMethod: 'Credit Card',
    bankName: 'HDFC Bank',
    cardLast4: null,
    region: 'India',
    status: 'active',
    notes: ''
  };
};
