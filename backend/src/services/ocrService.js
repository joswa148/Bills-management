import fs from 'fs/promises';
import path from 'path';

/**
 * Mock OCR service to simulate extraction of data from bill images/PDFs.
 * In a production environment, this would call AWS Textract, Google Document AI, etc.
 */
export const extractSubscriptionData = async (filePath) => {
  const fileName = path.basename(filePath).toLowerCase();
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Default mock data structure
  let extractedData = {
    serviceName: 'Detected Service',
    invoiceId: 'INV-' + Math.floor(Math.random() * 100000),
    subject: null,
    senderAddress: '',
    clientAddress: '',
    category: 'General',
    period: 'monthly',
    items: [], // New line items array
    subtotal: 0,
    discount: 0,
    amountDue: 0,
    currency: 'INR',
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    poNumber: null,
    paymentMethod: 'Credit Card',
    bankName: 'Unknown Bank',
    region: 'India',
    cardLast4: '****',
    status: 'active',
    notes: ''
  };

  // --- Helper to clean name from filename ---
  const cleanNameFromFileName = (name) => {
    // Remove extension, underscores, and common keywords
    let clean = name
      .replace(/\.(pdf|jpeg|jpg|png)$/i, '') // Remove extensions
      .replace(/[-_]/g, ' ') // Replace - and _ with space
      .replace(/(invoice|bill|receipt|statement|scan)/gi, '') // Remove keywords
      .trim();
    
    // Capitalize first letters
    return clean ? clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'New Service';
  };

  // Logic to return more realistic mocks based on filename keywords
  // --- Check specific services FIRST ---
  if (fileName.includes('netflix')) {
    extractedData = {
      ...extractedData,
      serviceName: 'Netflix',
      category: 'Entertainment',
      invoiceId: 'NET-' + Math.floor(Math.random() * 100000),
      items: [
        { description: 'Netflix Premium (Ultra HD)', quantity: 1, unitPrice: 649, amount: 649 }
      ],
      subtotal: 649,
      amountDue: 649,
      currency: 'INR',
      bankName: 'HDFC Bank',
      cardLast4: '1234'
    };
  } else if (fileName.includes('aws') || fileName.includes('amazon')) {
    extractedData = {
      ...extractedData,
      serviceName: 'AWS Cloud Services',
      category: 'Infrastructure',
      period: 'monthly',
      invoiceId: 'AWS-' + Math.floor(Math.random() * 100000),
      items: [
        { description: 'Amazon EC2 Instances', quantity: 720, unitPrice: 15, amount: 10800 },
        { description: 'Amazon S3 Storage', quantity: 50, unitPrice: 34, amount: 1700 }
      ],
      subtotal: 12500,
      amountDue: 12500,
      currency: 'INR',
      bankName: 'ICICI Bank',
      region: 'India',
      cardLast4: '5678'
    };
  } else if (fileName.includes('google') || fileName.includes('workspace')) {
    extractedData = {
      ...extractedData,
      serviceName: 'Google Workspace',
      category: 'Productivity',
      period: 'monthly',
      invoiceId: 'GWS-' + Math.floor(Math.random() * 100000),
      items: [
        { description: 'Business Starter License', quantity: 10, unitPrice: 140, amount: 1400 }
      ],
      subtotal: 1400,
      amountDue: 1400,
      currency: 'INR',
      bankName: 'Axis Bank',
      cardLast4: '9012'
    };
  } else if (fileName.includes('spotify')) {
    extractedData = {
      ...extractedData,
      serviceName: 'Spotify Premium',
      category: 'Entertainment',
      period: 'monthly',
      invoiceId: 'SPT-' + Math.floor(Math.random() * 100000),
      items: [
        { description: 'Premium Family Plan', quantity: 1, unitPrice: 119, amount: 119 }
      ],
      subtotal: 119,
      amountDue: 119,
      currency: 'INR',
      bankName: 'SBI',
      cardLast4: '3456'
    };
  } else if (fileName.includes('harvest')) {
    extractedData = {
      ...extractedData,
      serviceName: 'Harvest Services',
      senderAddress: 'Harvest Inc.\n123 Creative Way\nSan Francisco, CA 94103\nUSA',
      clientAddress: 'Joswa Solutions\n456 Tech Park\nBangalore, KA 560001\nIndia',
      invoiceId: 'INV-' + Math.floor(Math.random() * 100000),
      subject: 'Monthly Web Development & Consulting',
      category: 'Software',
      items: [
        { description: 'Web Development (Senior Developer)', quantity: 40, unitPrice: 25, amount: 1000 },
        { description: 'Project Management & Consulting', quantity: 5, unitPrice: 50, amount: 250 }
      ],
      subtotal: 1250,
      discount: 312.50, // 25% of 1250 as requested in template
      amountDue: 937.50,
      currency: 'INR',
      poNumber: 'PO-' + Math.floor(Math.random() * 9000),
      bankName: 'HDFC Bank',
      paymentMethod: 'Bank Transfer',
      notes: 'Thank you for your business. Please pay within 30 days.'
    };
  } else if (fileName.includes('invoice') || fileName.includes('bill') || fileName.includes('receipt') || fileName.includes('statement')) {
    // Dynamic extraction for generic bills
    const dynamicName = cleanNameFromFileName(fileName);
    extractedData = {
      ...extractedData,
      serviceName: dynamicName,
      invoiceId: 'DYN-' + Math.floor(Math.random() * 100000),
      amountDue: Math.floor(Math.random() * 5000) + 500, // Random plausible amount
      currency: 'INR',
      category: fileName.includes('elec') ? 'Utilities' : 'General'
    };
    extractedData.subtotal = extractedData.amountDue;
  } else if (fileName.includes('document') || fileName.includes('scan') || fileName.includes('pdf') || fileName.includes('jpg') || fileName.includes('png')) {
    // Catch-all for other document types
    const dynamicName = cleanNameFromFileName(fileName);
    extractedData = {
      ...extractedData,
      serviceName: dynamicName || 'New Subscription',
      invoiceId: 'DOC-' + Math.floor(Math.random() * 100000),
      amountDue: Math.floor(Math.random() * 2000) + 100,
      currency: 'INR'
    };
    extractedData.subtotal = extractedData.amountDue;
  }

  return extractedData;
};
