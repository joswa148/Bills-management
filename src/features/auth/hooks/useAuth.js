import { useState, useCallback } from 'react';

/**
 * Mock Auth Hook
 * This implements a simple fake authentication logic as required in Phase 1.
 */
export function useAuth() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('billdash_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback(async (email) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock user
    const mockUser = {
      id: '1',
      name: 'Admin User',
      email: email,
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    };
    
    localStorage.setItem('billdash_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('billdash_user');
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    login,
    logout
  };
}
