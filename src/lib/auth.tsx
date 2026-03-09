"use client";
import { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fit-user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('fit-user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fit-user');
  };

  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
