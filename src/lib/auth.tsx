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
      loginAuthentik();
    } catch {}
    setLoaded(true);
  }, []);

  const loginAuthentik = ()=> {
    fetch('/api/auth/me').then(r=>r.json()).then((user) => {
      if (user) {
        const fit_user = { username: user.username, role: user?.groups?.length > 0 ? user?.groups[0] : 'user' };
        setUser(fit_user);
        localStorage.setItem('fit-user', JSON.stringify(fit_user));
      }
    });
  }

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
