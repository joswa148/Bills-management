import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api/authApi';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: !!token }),
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage'); // Clear storage
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { user } = await authApi.getMe();
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          // If 401/403, we might want to logout
          if (error.response?.status === 401) {
            get().logout();
          }
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const { user } = await authApi.updateMe(data);
          set({ user, isLoading: false });
          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Local state update helper
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
