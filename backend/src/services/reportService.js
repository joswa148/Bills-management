import { pool } from '../config/database.js';

export const getDashboardSummary = async (userId) => {
  // Join with the latest invoice for each subscription to get the price
  const [rows] = await pool.execute(
    `SELECT s.*, i.amount_due as latest_price
     FROM subscriptions s
     LEFT JOIN invoices i ON s.id = i.subscription_id
     WHERE s.user_id = ? AND s.status = "active"
     AND (i.id IS NULL OR i.issue_date = (SELECT MAX(issue_date) FROM invoices WHERE subscription_id = s.id))`,
    [userId]
  );

  let totalMonthly = 0;
  let totalYearly = 0;

  rows.forEach(sub => {
    const price = parseFloat(sub.latest_price || 0);
    let monthly = 0;
    let yearly = 0;

    if (sub.period === 'monthly') {
      monthly = price;
      yearly = price * 12;
    } else if (sub.period === 'quarterly') {
      monthly = price / 3;
      yearly = price * 4;
    } else if (sub.period === 'yearly') {
      monthly = price / 12;
      yearly = price;
    }

    totalMonthly += monthly;
    totalYearly += yearly;
  });

  return {
    totalMonthly: parseFloat(totalMonthly.toFixed(2)),
    totalYearly: parseFloat(totalYearly.toFixed(2)),
    activeCount: rows.length,
  };
};

export const getSpendingByCategory = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT s.category, SUM(
      CASE 
        WHEN s.period = 'monthly' THEN i.amount_due 
        WHEN s.period = 'quarterly' THEN i.amount_due / 3 
        WHEN s.period = 'yearly' THEN i.amount_due / 12 
        ELSE 0 
      END
    ) as monthly,
    SUM(
      CASE 
        WHEN s.period = 'monthly' THEN i.amount_due * 12 
        WHEN s.period = 'quarterly' THEN i.amount_due * 4 
        WHEN s.period = 'yearly' THEN i.amount_due 
        ELSE 0 
      END
    ) as yearly
    FROM subscriptions s
    LEFT JOIN invoices i ON s.id = i.subscription_id
    WHERE s.user_id = ? AND s.status = "active"
    AND (i.id IS NULL OR i.issue_date = (SELECT MAX(issue_date) FROM invoices WHERE subscription_id = s.id))
    GROUP BY s.category`,
    [userId]
  );

  return rows.map(row => ({
    name: row.category || 'Uncategorized',
    monthly: parseFloat(row.monthly || '0').toFixed(2),
    yearly: parseFloat(row.yearly || '0').toFixed(2),
  }));
};
