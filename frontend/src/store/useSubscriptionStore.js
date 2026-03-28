import { create } from 'zustand';
import { mockSubscriptions } from '../lib/mockData';

/**
 * @typedef {import('../lib/mockData').Subscription} Subscription
 */

/**
 * @typedef {Object} SubscriptionStore
 * @property {Subscription[]} subscriptions
 * @property {boolean} isLoading
 * @property {(subscription: Subscription) => void} addSubscription
 * @property {(id: string, updates: Partial<Subscription>) => void} updateSubscription
 * @property {(id: string) => void} deleteSubscription
 * @property {(subscriptions: Subscription[]) => void} setSubscriptions
 */

export const useSubscriptionStore = create((set) => ({
  subscriptions: mockSubscriptions, // Start with mock data
  isLoading: false,

  setSubscriptions: (subscriptions) => set({ subscriptions }),

  addSubscription: (subscription) => 
    set((state) => ({ 
      subscriptions: [subscription, ...state.subscriptions] 
    })),

  updateSubscription: (id, updates) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub
      ),
    })),

  deleteSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),
}));
