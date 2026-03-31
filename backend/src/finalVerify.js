import { pool } from './config/database.js';
import * as authService from './services/authService.js';
import * as subscriptionService from './services/subscriptionService.js';

async function finalVerification() {
  try {
    console.log('--- Starting Final Verification ---');
    
    // 1. Register a test user
    const testEmail = `test_${Date.now()}@example.com`;
    const user = await authService.register({
      name: 'Test User',
      email: testEmail,
      password: 'password123'
    });
    console.log('✅ User registered:', user.id);

    // 2. Add a subscription (Process Invoice)
    const subData = {
      serviceName: 'Netflix',
      category: 'Entertainment',
      period: 'monthly',
      subtotal: 499,
      amount_due: 499,
      currency: 'INR',
      issue_date: new Date().toISOString().split('T')[0],
      invoice_id_number: 'INV-001',
      payment_method: 'Credit Card',
      card_last4: '1234',
      bank_name: 'HDFC',
      region: 'India'
    };

    const result = await subscriptionService.processInvoice(user.id, subData);
    console.log('✅ Subscription processed:', result.subscriptionId);

    // 3. Get all subscriptions (ensure no column errors)
    const subscriptions = await subscriptionService.getAllSubscriptions(user.id);
    console.log('✅ Retrieved subscriptions:', subscriptions.length);
    console.log('Sample Sub:', JSON.stringify(subscriptions[0], null, 2));

    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

finalVerification();
