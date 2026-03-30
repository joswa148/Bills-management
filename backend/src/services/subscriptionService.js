import { pool } from '../app.js';
import crypto from 'crypto';
import { createInvoiceNotification } from './notificationService.js';
import { addDays, addMonths, addYears } from 'date-fns';

/**
 * Process a new invoice: creates/updates subscription, saves invoice and items.
 */
export const processInvoice = async (userId, data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      serviceName, category, period, subtotal, discount, amount_due, 
      currency, issue_date, due_date, invoice_id_number, sender_address, 
      client_address, subject, po_number, payment_method, card_last4, 
      bank_name, notes, items 
    } = data;

    // 1. Check for existing subscription for this service
    let [subs] = await connection.execute(
      'SELECT id FROM subscriptions WHERE user_id = ? AND service_name = ?',
      [userId, serviceName]
    );

    let subscriptionId;
    const issueDate = new Date(issue_date);
    
    // Calculate next billing date based on period
    let nextBillingDate = new Date(issueDate);
    if (period === 'monthly') nextBillingDate = addMonths(nextBillingDate, 1);
    else if (period === 'quarterly') nextBillingDate = addMonths(nextBillingDate, 3);
    else if (period === 'yearly') nextBillingDate = addYears(nextBillingDate, 1);

    if (subs.length > 0) {
      subscriptionId = subs[0].id;
      // Update existing subscription master
      await connection.execute(
        'UPDATE subscriptions SET category = ?, period = ?, last_invoice_date = ?, next_billing_date = ?, status = "active" WHERE id = ?',
        [category || 'General', period, issueDate, nextBillingDate, subscriptionId]
      );
    } else {
      // Create new subscription master
      subscriptionId = crypto.randomUUID();
      await connection.execute(
        `INSERT INTO subscriptions (id, user_id, service_name, category, period, status, last_invoice_date, next_billing_date, region) 
         VALUES (?, ?, ?, ?, ?, "active", ?, ?, ?)`,
        [subscriptionId, userId, serviceName, category || 'General', period, issueDate, nextBillingDate, data.region || 'India']
      );
    }

    // 2. Create Invoice
    const invoiceId = crypto.randomUUID();
    await connection.execute(
      `INSERT INTO invoices (
        id, user_id, subscription_id, invoice_id_number, sender_address, client_address, 
        subject, issue_date, due_date, po_number, subtotal, discount, amount_due, 
        currency, payment_method, card_last4, bank_name, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processed')`,
      [
        invoiceId, userId, subscriptionId, invoice_id_number, sender_address, client_address, 
        subject, issueDate, due_date ? new Date(due_date) : null, po_number, 
        subtotal, discount || 0, amount_due, currency || 'INR', 
        payment_method, card_last4, bank_name, notes
      ]
    );

    // 3. Create Invoice Items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemId = crypto.randomUUID();
        await connection.execute(
          'INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)',
          [itemId, invoiceId, item.description, item.quantity || 1, item.unitPrice, item.amount]
        );
      }
    }

    await connection.commit();

    // 4. Trigger Notification
    await createInvoiceNotification(userId, {
      serviceName,
      invoiceId: invoice_id_number || 'New Invoice',
      amountDue: amount_due,
      currency: currency || 'INR',
      status: 'Processed'
    });

    return { subscriptionId, invoiceId };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllInvoices = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT i.*, s.service_name, s.category 
     FROM invoices i 
     LEFT JOIN subscriptions s ON i.subscription_id = s.id 
     WHERE i.user_id = ? 
     ORDER BY i.issue_date DESC`,
    [userId]
  );
  return rows;
};

export const getInvoiceDetails = async (invoiceId, userId) => {
  const [invoiceRows] = await pool.execute(
    'SELECT * FROM invoices WHERE id = ? AND user_id = ?',
    [invoiceId, userId]
  );

  if (invoiceRows.length === 0) return null;

  const [itemRows] = await pool.execute(
    'SELECT * FROM invoice_items WHERE invoice_id = ?',
    [invoiceId]
  );

  return {
    ...invoiceRows[0],
    items: itemRows
  };
};

export const deleteInvoice = async (invoiceId, userId) => {
  await pool.execute('DELETE FROM invoices WHERE id = ? AND user_id = ?', [invoiceId, userId]);
  return true;
};

// Compatibility shim for existing frontend code if needed
export const getAllSubscriptions = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT s.*, i.amount_due as price_inr, i.invoice_id_number as invoice_id 
     FROM subscriptions s 
     LEFT JOIN invoices i ON s.id = i.subscription_id 
     WHERE s.user_id = ? 
     AND (i.id IS NULL OR i.issue_date = (SELECT MAX(issue_date) FROM invoices WHERE subscription_id = s.id))`,
    [userId]
  );
  return rows;
};
