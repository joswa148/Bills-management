import { pool } from '../app.js';
import crypto from 'crypto';

export const getAllSubscriptions = async (userId, filters = {}) => {
  const { status, region, bankName } = filters;
  
  let query = 'SELECT * FROM subscriptions WHERE user_id = ?';
  const params = [userId];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (region) {
    query += ' AND region = ?';
    params.push(region);
  }
  if (bankName) {
    query += ' AND bank_name LIKE ?';
    params.push(`%${bankName}%`);
  }

  query += ' ORDER BY validity_date ASC';

  const [rows] = await pool.execute(query, params);
  
  // Map snake_case to camelCase for the frontend if needed
  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    serviceName: row.service_name,
    category: row.category,
    period: row.period,
    priceINR: row.price_inr,
    priceAED: row.price_aed,
    totalYearly: row.total_yearly,
    validityDate: row.validity_date,
    paymentMethod: row.payment_method,
    cardLast4: row.card_last4,
    bankName: row.bank_name,
    region: row.region,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

export const getSubscriptionById = async (id, userId) => {
  const [rows] = await pool.execute(
    'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  
  if (rows.length === 0) {
    throw new Error('Subscription not found');
  }
  
  const row = rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    serviceName: row.service_name,
    category: row.category,
    period: row.period,
    priceINR: row.price_inr,
    priceAED: row.price_aed,
    totalYearly: row.total_yearly,
    validityDate: row.validity_date,
    paymentMethod: row.payment_method,
    cardLast4: row.card_last4,
    bankName: row.bank_name,
    region: row.region,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const createSubscription = async (userId, data) => {
  const priceINR = parseFloat(data.priceINR);
  let totalYearly = 0;
  
  if (data.period === 'monthly') totalYearly = priceINR * 12;
  else if (data.period === 'quarterly') totalYearly = priceINR * 4;
  else if (data.period === 'yearly') totalYearly = priceINR;

  const id = crypto.randomUUID();
  const validityDate = new Date(data.validityDate);

  await pool.execute(
    `INSERT INTO subscriptions (
      id, user_id, service_name, category, period, price_inr, price_aed, 
      total_yearly, validity_date, payment_method, card_last4, bank_name, 
      region, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, userId, data.serviceName, data.category || 'General', data.period,
      data.priceINR, data.priceAED, totalYearly, validityDate,
      data.paymentMethod, data.cardLast4, data.bankName, data.region,
      data.status || 'active', data.notes
    ]
  );

  return { ...data, id, userId, totalYearly };
};

export const updateSubscription = async (id, userId, data) => {
  const subscription = await getSubscriptionById(id, userId);

  let updateData = { ...data };
  
  if (data.priceINR || data.period) {
    const priceINR = data.priceINR ? parseFloat(data.priceINR) : parseFloat(subscription.priceINR);
    const period = data.period || subscription.period;
    
    let totalYearly = 0;
    if (period === 'monthly') totalYearly = priceINR * 12;
    else if (period === 'quarterly') totalYearly = priceINR * 4;
    else if (period === 'yearly') totalYearly = priceINR;
    
    updateData.totalYearly = totalYearly;
  }

  const fields = [];
  const params = [];
  
  // Map camelCase to snake_case and build query
  const mappings = {
    serviceName: 'service_name',
    category: 'category',
    period: 'period',
    priceINR: 'price_inr',
    priceAED: 'price_aed',
    totalYearly: 'total_yearly',
    validityDate: 'validity_date',
    paymentMethod: 'payment_method',
    cardLast4: 'card_last4',
    bankName: 'bank_name',
    region: 'region',
    status: 'status',
    notes: 'notes'
  };

  for (const [key, val] of Object.entries(updateData)) {
    if (mappings[key]) {
      fields.push(`${mappings[key]} = ?`);
      params.push(key === 'validityDate' ? new Date(val) : val);
    }
  }

  if (fields.length > 0) {
    params.push(id);
    await pool.execute(
      `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  }

  return await getSubscriptionById(id, userId);
};

export const deleteSubscription = async (id, userId) => {
  await getSubscriptionById(id, userId);
  await pool.execute('DELETE FROM subscriptions WHERE id = ?', [id]);
  return true;
};
