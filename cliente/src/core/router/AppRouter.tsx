/**
 * App Router
 * Configuración de rutas de la aplicación
 * Principio: Single Responsibility - Solo maneja routing
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/shared/components/common/AuthGuard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/core/config/routes.config';

// Pages - Lazy loading para mejor performance
import { lazy, Suspense } from 'react';

// Auth
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));

// Admin
const AdminHomePage = lazy(() => import('@/features/admin/pages/AdminHomePage'));
const SurveyListPage = lazy(() => import('@/features/surveys/pages/SurveyListPage'));
const CreateSurveyPage = lazy(() => import('@/features/surveys/pages/CreateSurveyPage'));
const EditSurveyPage = lazy(() => import('@/features/surveys/pages/EditSurveyPage'));
const SurveyDetailPage = lazy(() => import('@/features/surveys/pages/SurveyDetailPage'));
const MetricsPage = lazy(() => import('@/features/analytics/pages/MetricsPage'));

// User
const UserHomePage = lazy(() => import('@/features/user/pages/UserHomePage'));
const DynamicSurveyPage = lazy(() => import('@/features/responses/pages/DynamicSurveyPage'));
const ThankYouPage = lazy(() => import('@/features/responses/pages/ThankYouPage'));

// Loading component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * Componente para redirigir a la ruta apropiada según el rol del usuario
 */
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return user.role === 'admin' 
    ? <Navigate to={ROUTES.ADMIN.HOME} replace />
    : <Navigate to={ROUTES.USER.HOME} replace />;
}

/**
 * Configuración de rutas de la aplicación
 */
export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Admin Routes */}
        <Route
          path={ROUTES.ADMIN.HOME}
          element={
            <AuthGuard requireRole="admin">
              <AdminHomePage />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.SURVEYS.LIST}
          element={
            <AuthGuard requireRole="admin">
              <SurveyListPage />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.SURVEYS.CREATE}
          element={
            <AuthGuard requireRole="admin">
              <CreateSurveyPage />
            </AuthGuard>
          }
        />
        <Route
          path={`${ROUTES.ADMIN.SURVEYS.LIST}/:id`}
          element={
            <AuthGuard requireRole="admin">
              <SurveyDetailPage />
            </AuthGuard>
          }
        />
        <Route
          path={`${ROUTES.ADMIN.SURVEYS.LIST}/:id/edit`}
          element={
            <AuthGuard requireRole="admin">
              <EditSurveyPage />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.ADMIN.METRICS}
          element={
            <AuthGuard requireRole="admin">
              <MetricsPage />
            </AuthGuard>
          }
        />

        {/* User Routes */}
        <Route
          path={ROUTES.USER.HOME}
          element={
            <AuthGuard requireRole="user">
              <UserHomePage />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.USER.SURVEY}
          element={
            <AuthGuard requireRole="user">
              <DynamicSurveyPage />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.USER.THANK_YOU}
          element={
            <AuthGuard requireRole="user">
              <ThankYouPage />
            </AuthGuard>
          }
        />

        {/* 404 - Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
