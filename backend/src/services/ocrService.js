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
    invoiceId: null,
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

  // Logic to return more realistic mocks based on filename keywords
  if (fileName.includes('harvest') || fileName.includes('invoice') || fileName.includes('bill') || fileName.includes('receipt') || fileName.includes('statement')) {
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
  } else if (fileName.includes('netflix')) {
    extractedData = {
      ...extractedData,
      serviceName: 'Netflix',
      category: 'Entertainment',
      priceINR: 649,
      priceAED: 29,
      bankName: 'HDFC Bank',
      cardLast4: '1234'
    };
  } else if (fileName.includes('aws') || fileName.includes('amazon')) {
    extractedData = {
      ...extractedData,
      serviceName: 'AWS Cloud Services',
      category: 'Infrastructure',
      period: 'monthly',
      priceINR: 12500,
      priceAED: 550,
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
      priceINR: 1400,
      priceAED: 60,
      bankName: 'Axis Bank',
      cardLast4: '9012'
    };
  } else if (fileName.includes('spotify')) {
    extractedData = {
      ...extractedData,
      serviceName: 'Spotify Premium',
      category: 'Entertainment',
      period: 'monthly',
      priceINR: 119,
      priceAED: 19,
      bankName: 'SBI',
      cardLast4: '3456'
    };
  }

  return extractedData;
};
