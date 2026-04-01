import { pool } from '../config/database.js';
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
      bank_name, notes, items, _fileHash, _meta, _jobId
    } = data;

    // 0. Check for duplicate invoice_id_number (same vendor invoice scanned twice)
    let isDuplicateInvoiceId = false;
    if (invoice_id_number) {
      const [existingInv] = await connection.execute(
        'SELECT id FROM invoices WHERE user_id = ? AND invoice_id_number = ?',
        [userId, invoice_id_number]
      );
      if (existingInv.length > 0) {
        isDuplicateInvoiceId = true;
        console.warn(`[Invoice] Duplicate invoice_id_number detected: ${invoice_id_number} for user ${userId}`);
      }
    }

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

    // 1.5. Fetch raw scan result if jobId provided (Audit Trail)
    let rawScanResult = null;
    if (_jobId) {
      const [jobs] = await connection.execute(
        'SELECT result_data FROM scan_jobs WHERE id = ? LIMIT 1',
        [_jobId]
      );
      if (jobs.length > 0) {
        rawScanResult = jobs[0].result_data;
      }
    }

    // 2. Create Invoice
    const invoiceId = crypto.randomUUID();
    await connection.execute(
      `INSERT INTO invoices (
        id, user_id, subscription_id, invoice_id_number, sender_address, client_address, 
        subject, issue_date, due_date, po_number, subtotal, discount, amount_due, 
        currency, payment_method, card_last4, bank_name, notes, status, file_hash, scan_confidence,
        scan_job_id, raw_scan_result
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processed', ?, ?, ?, ?)`,
      [
        invoiceId, userId, subscriptionId, invoice_id_number, sender_address, client_address, 
        subject, issueDate, due_date ? new Date(due_date) : null, po_number, 
        subtotal, discount || 0, amount_due, currency || 'INR', 
        payment_method, card_last4, bank_name, notes,
        _fileHash || null,
        _meta?.overallConfidence || null,
        _jobId || null,
        rawScanResult ? JSON.stringify(rawScanResult) : null
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

    return { subscriptionId, invoiceId, isDuplicateInvoiceId };

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

export const deleteSubscription = async (subscriptionId, userId) => {
  // 1. Delete all invoices associated with this subscription 
  // (Manual cleanup because our FK is set to ON DELETE SET NULL)
  const [invoices] = await pool.execute(
    'SELECT id FROM invoices WHERE subscription_id = ? AND user_id = ?',
    [subscriptionId, userId]
  );
  
  for (const inv of invoices) {
    await deleteInvoice(inv.id, userId);
  }

  // 2. Finally delete the subscription record
  await pool.execute(
    'DELETE FROM subscriptions WHERE id = ? AND user_id = ?',
    [subscriptionId, userId]
  );
  return true;
};

export const deleteInvoice = async (invoiceId, userId) => {
  // Cascading deletes on invoice_items are handled by the DB (ON DELETE CASCADE)
  await pool.execute('DELETE FROM invoices WHERE id = ? AND user_id = ?', [invoiceId, userId]);
  return true;
};

// Compatibility shim for existing frontend code if needed
export const getAllSubscriptions = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT s.*, i.id AS latest_invoice_id, i.amount_due AS price_inr, i.invoice_id_number AS invoice_id 
     FROM subscriptions s 
     LEFT JOIN (
       SELECT id, subscription_id, amount_due, invoice_id_number, issue_date 
       FROM invoices 
       WHERE (subscription_id, issue_date) IN (
         SELECT subscription_id, MAX(issue_date) FROM invoices GROUP BY subscription_id
       )
     ) i ON s.id = i.subscription_id 
     WHERE s.user_id = ?`,
    [userId]
  );
  return rows;
};

/**
 * Duplicate detection — checks if this exact file was already scanned
 * by looking up the SHA-256 hash in the invoices table.
 */
export const checkDuplicateFileHash = async (userId, fileHash) => {
  if (!fileHash) return null;
  const [rows] = await pool.execute(
    `SELECT i.id, i.invoice_id_number, i.amount_due, i.created_at, s.service_name
     FROM invoices i
     LEFT JOIN subscriptions s ON i.subscription_id = s.id
     WHERE i.user_id = ? AND i.file_hash = ?
     LIMIT 1`,
    [userId, fileHash]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Vendor Normalization — maps OCR names to canonical names
 */
export const getCanonicalVendorName = async (rawName) => {
  if (!rawName) return rawName;
  const [rows] = await pool.execute(
    'SELECT canonical_name FROM vendor_mappings WHERE raw_name = ? LIMIT 1',
    [rawName]
  );
  return rows.length > 0 ? rows[0].canonical_name : rawName;
};

export const addVendorMapping = async (rawName, canonicalName) => {
  if (!rawName || !canonicalName) return false;
  // If the user hasn't changed it, don't create a useless mapping
  if (rawName === canonicalName) return false;
  
  const mappingId = crypto.randomUUID();
  // INSERT IGNORE ensures we don't crash on duplicate raw_names
  await pool.execute(
    'INSERT IGNORE INTO vendor_mappings (id, raw_name, canonical_name) VALUES (?, ?, ?)',
    [mappingId, rawName, canonicalName]
  );
  return true;
};
