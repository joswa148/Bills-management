import { prisma } from '../app.js';

export const getDashboardSummary = async (userId) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId, status: 'active' },
  });

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    const price = parseFloat(sub.priceINR);
    if (sub.period === 'monthly') return acc + price;
    if (sub.period === 'quarterly') return acc + (price / 3);
    if (sub.period === 'yearly') return acc + (price / 12);
    return acc;
  }, 0);

  const totalYearly = subscriptions.reduce((acc, sub) => {
    return acc + parseFloat(sub.totalYearly);
  }, 0);

  const activeCount = subscriptions.length;

  return {
    totalMonthly: parseFloat(totalMonthly.toFixed(2)),
    totalYearly: parseFloat(totalYearly.toFixed(2)),
    activeCount,
  };
};

export const getSpendingByCategory = async (userId) => {
  const categories = await prisma.subscription.groupBy({
    by: ['category'],
    where: { userId, status: 'active' },
    _sum: {
      priceINR: true,
      totalYearly: true,
    },
  });

  return categories.map(c => ({
    name: c.category || 'Uncategorized',
    monthly: parseFloat(c._sum.priceINR?.toString() || '0'),
    yearly: parseFloat(c._sum.totalYearly?.toString() || '0'),
  }));
};
// Note: Category field was not in initial Prisma schema but was in user request. 
// I should add 'category' to the Prisma schema if it's missing.
