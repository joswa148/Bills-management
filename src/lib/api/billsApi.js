import { mockBills } from './mockData';

// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const billsApi = {
  getBills: async () => {
    await delay(500);
    return mockBills;
  },
  getBill: async (id) => {
    await delay(500);
    return mockBills.find(b => b.id === id);
  },
  createBill: async (bill) => {
    await delay(500);
    const newBill = { ...bill, id: String(Date.now()) };
    mockBills.push(newBill);
    return newBill;
  },
  updateBill: async (id, data) => {
    await delay(500);
    const index = mockBills.findIndex(b => b.id === id);
    if (index > -1) {
      mockBills[index] = { ...mockBills[index], ...data };
      return mockBills[index];
    }
    throw new Error("Bill not found");
  },
  deleteBill: async (id) => {
    await delay(500);
    const index = mockBills.findIndex(b => b.id === id);
    if (index > -1) {
      mockBills.splice(index, 1);
      return true;
    }
    return false;
  }
};
