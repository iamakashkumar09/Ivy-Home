'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { authAPI, getAccessToken, clearTokens } from '@/lib/api';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = getAccessToken();
    const storedUser = localStorage.getItem('ivy_user');
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u } = await authAPI.login(email, password);
    setUser(u);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ivy_user', JSON.stringify(u));
    }
  }, []);

  const logout = useCallback(async () => {
    await authAPI.logout();
    clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ivy_user');
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
