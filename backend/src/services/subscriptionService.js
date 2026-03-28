import { prisma } from '../app.js';

export const getAllSubscriptions = async (userId, filters = {}) => {
  const { status, region, bankName } = filters;
  
  const where = {
    userId,
    ...(status && { status }),
    ...(region && { region }),
    ...(bankName && { bankName: { contains: bankName, mode: 'insensitive' } }),
  };

  return await prisma.subscription.findMany({
    where,
    orderBy: { validityDate: 'asc' },
  });
};

export const getSubscriptionById = async (id, userId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { id, userId },
  });
  
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  return subscription;
};

export const createSubscription = async (userId, data) => {
  // Calculate total yearly based on period
  const priceINR = parseFloat(data.priceINR);
  let totalYearly = 0;
  
  if (data.period === 'monthly') totalYearly = priceINR * 12;
  else if (data.period === 'quarterly') totalYearly = priceINR * 4;
  else if (data.period === 'yearly') totalYearly = priceINR;

  return await prisma.subscription.create({
    data: {
      ...data,
      userId,
      totalYearly,
      validityDate: new Date(data.validityDate),
    },
  });
};

export const updateSubscription = async (id, userId, data) => {
  // Ensure ownership
  await getSubscriptionById(id, userId);

  let updateData = { ...data };
  
  if (data.validityDate) {
    updateData.validityDate = new Date(data.validityDate);
  }

  if (data.priceINR || data.period) {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    const priceINR = data.priceINR ? parseFloat(data.priceINR) : parseFloat(sub.priceINR);
    const period = data.period || sub.period;
    
    let totalYearly = 0;
    if (period === 'monthly') totalYearly = priceINR * 12;
    else if (period === 'quarterly') totalYearly = priceINR * 4;
    else if (period === 'yearly') totalYearly = priceINR;
    
    updateData.totalYearly = totalYearly;
  }

  return await prisma.subscription.update({
    where: { id },
    data: updateData,
  });
};

export const deleteSubscription = async (id, userId) => {
  await getSubscriptionById(id, userId);
  return await prisma.subscription.delete({ where: { id } });
};
