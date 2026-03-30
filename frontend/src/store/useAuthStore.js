import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: !!token }),
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage'); // Clear storage
      },

      updateUser: (updates) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...updates } : null 
        })),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
