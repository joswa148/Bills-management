import { create } from 'zustand';
import { billsApi } from '../lib/api/billsApi';

export const useSubscriptionStore = create((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  fetchSubscriptions: async () => {
    set({ isLoading: true });
    try {
      const { subscriptions } = await billsApi.getBills();
      set({ subscriptions, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addSubscription: async (subscription) => {
    set({ isLoading: true });
    try {
      const result = await billsApi.createBill(subscription);
      // Since it returns IDs, we should re-fetch to get the full view
      await get().fetchSubscriptions();
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateSubscription: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updatedSub = await billsApi.updateBill(id, updates);
      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === id ? updatedSub : sub
        ),
        isLoading: false
      }));
      return updatedSub;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteSubscription: async (id) => {
    set({ isLoading: true });
    try {
      await billsApi.deleteBill(id);
      set((state) => ({
        subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setSubscriptions: (subscriptions) => set({ subscriptions }),
}));
