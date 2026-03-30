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

  // Default mock data
  let extractedData = {
    serviceName: 'Detected Service',
    invoiceId: null,
    subject: null,
    category: 'General',
    period: 'monthly',
    priceINR: 0,
    priceAED: 0,
    subtotal: 0,
    discount: 0,
    amountDue: 0,
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    poNumber: null,
    paymentMethod: 'Credit Card',
    bankName: 'Unknown Bank',
    region: 'India',
    cardLast4: '****',
    status: 'active',
    notes: 'Automatically extracted from bill.'
  };

  // Logic to return more realistic mocks based on filename keywords
  if (fileName.includes('harvest') || fileName.includes('invoice') || fileName.includes('bill') || fileName.includes('receipt') || fileName.includes('statement')) {
    extractedData = {
      ...extractedData,
      serviceName: fileName.includes('harvest') ? 'Harvest Invoice' : 'Generic Invoice',
      invoiceId: 'INV-' + Math.floor(Math.random() * 100000),
      subject: fileName.includes('harvest') ? 'Monthly Service Maintenance' : 'Service Bill',
      category: 'Software',
      subtotal: 1250,
      discount: 250,
      amountDue: 1000,
      priceINR: 1000,
      priceAED: 44,
      poNumber: 'PO-' + Math.floor(Math.random() * 9000),
      bankName: 'HDFC Bank',
      paymentMethod: 'Bank Transfer'
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
