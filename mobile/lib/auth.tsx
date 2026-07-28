import React, {
  createContext, useContext, useState, useEffect, ReactNode,
} from 'react';
import { api, initApi } from './api';
import { storage } from './storage';
import type { User } from './types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await initApi();
      const savedToken = await storage.getToken();
      const savedUser = await storage.getUser();
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    const { token: t, name, role } = data;
    const u: User = { name, email, role };
    api.setToken(t);
    await storage.setToken(t);
    await storage.setUser(u);
    setToken(t);
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    const { token: t, role } = data;
    const u: User = { name, email, role };
    api.setToken(t);
    await storage.setToken(t);
    await storage.setUser(u);
    setToken(t);
    setUser(u);
  };

  const logout = async () => {
    api.setToken(null);
    await storage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
