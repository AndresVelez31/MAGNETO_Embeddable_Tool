/**
 * Auth Hook
 * Hook personalizado para manejo de autenticación
 * Principio: Information Expert (GRASP)
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, AuthContextType } from '../types/auth.types';
import { STORAGE_KEYS } from '@/core/config/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Intentar recuperar usuario del localStorage
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = useCallback((credentials: LoginCredentials): User | null => {
    const { username, password } = credentials;

    // TODO: Implementar llamada real a API
    // Por ahora, credenciales de ejemplo
    if (username === 'admin' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        name: 'Administrador',
        username: 'admin',
        email: 'admin@magneto.com',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(adminUser));
      return adminUser;
    } else if (username === 'user' && password === 'user123') {
      const normalUser: User = {
        id: '2',
        name: 'Juan Pérez',
        username: 'user',
        email: 'user@example.com',
        role: 'user',
      };
      setUser(normalUser);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalUser));
      return normalUser;
    }

    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
