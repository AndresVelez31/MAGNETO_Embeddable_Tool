/**
 * Auth Guard Component
 * Componente de protección de rutas
 * Principio: Single Responsibility - Solo maneja autorización de rutas
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/core/config/routes.config';
import type { ReactNode } from 'react';
import type { UserRole } from '@/features/auth/types/auth.types';

interface AuthGuardProps {
  children: ReactNode;
  requireRole?: UserRole;
}

/**
 * Componente que protege rutas requiriendo autenticación
 * y opcionalmente un rol específico
 */
export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Si se requiere un rol específico y no coincide, redirigir
  if (requireRole && user.role !== requireRole) {
    const redirectPath = user.role === 'admin' ? ROUTES.ADMIN.HOME : ROUTES.USER.HOME;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
