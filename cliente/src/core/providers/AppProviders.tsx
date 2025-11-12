/**
 * App Providers
 * Agrupa todos los providers de la aplicación
 * Principio: Single Responsibility, Composition
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/hooks/useAuth';
import { Toaster as SonnerToaster } from '@/shared/components/ui/sonner';
import type { ReactNode } from 'react';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Componente que envuelve la aplicación con todos los providers necesarios
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
          <SonnerToaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
