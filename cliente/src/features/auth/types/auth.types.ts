/**
 * Auth Types
 * Tipos para autenticación y usuarios
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => User | null;
  logout: () => void;
}
