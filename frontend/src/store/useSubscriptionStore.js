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
      const newSub = await billsApi.createBill(subscription);
      set((state) => ({ 
        subscriptions: [newSub, ...state.subscriptions],
        isLoading: false 
      }));
      return newSub;
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
