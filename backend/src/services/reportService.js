import { pool } from '../app.js';

export const getDashboardSummary = async (userId) => {
  const [subscriptions] = await pool.execute(
    'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active"',
    [userId]
  );

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    const price = parseFloat(sub.price_inr);
    if (sub.period === 'monthly') return acc + price;
    if (sub.period === 'quarterly') return acc + (price / 3);
    if (sub.period === 'yearly') return acc + (price / 12);
    return acc;
  }, 0);

  const totalYearly = subscriptions.reduce((acc, sub) => {
    return acc + parseFloat(sub.total_yearly);
  }, 0);

  const activeCount = subscriptions.length;

  return {
    totalMonthly: parseFloat(totalMonthly.toFixed(2)),
    totalYearly: parseFloat(totalYearly.toFixed(2)),
    activeCount,
  };
};

export const getSpendingByCategory = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT category, SUM(price_inr) as monthly, SUM(total_yearly) as yearly 
     FROM subscriptions 
     WHERE user_id = ? AND status = "active" 
     GROUP BY category`,
    [userId]
  );

  return rows.map(row => ({
    name: row.category || 'Uncategorized',
    monthly: parseFloat(row.monthly || '0'),
    yearly: parseFloat(row.yearly || '0'),
  }));
};
