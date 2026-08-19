import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface User { id: number; name: string; email: string; role: string; active: boolean; nip?: string; unit_kerja?: string; }
interface AuthCtx { user: User | null; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; loading: boolean; }

const AuthContext = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post('/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } finally { setLoading(false); }
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};
