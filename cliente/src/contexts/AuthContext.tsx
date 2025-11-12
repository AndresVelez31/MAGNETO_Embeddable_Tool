import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type UserRole = 'admin' | 'user';

interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): User | null => {
    // Credenciales de ejemplo
    if (username === 'admin' && password === 'admin123') {
      const adminUser = { id: '1', name: 'Administrador', username: 'admin', role: 'admin' as UserRole };
      setUser(adminUser);
      return adminUser;
    } else if (username === 'user' && password === 'user123') {
      const normalUser = { id: '2', name: 'Juan Pérez', username: 'user', role: 'user' as UserRole };
      setUser(normalUser);
      return normalUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
