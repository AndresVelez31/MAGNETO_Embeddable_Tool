/**
 * Routes Configuration
 * Configuración centralizada de rutas de la aplicación
 * Principio: Single Source of Truth
 */

export const ROUTES = {
  // Public
  LOGIN: '/login',
  
  // Admin
  ADMIN: {
    HOME: '/admin',
    SURVEYS: {
      LIST: '/admin/surveys',
      CREATE: '/admin/surveys/create',
      DETAIL: (id: string) => `/admin/surveys/${id}`,
      EDIT: (id: string) => `/admin/surveys/${id}/edit`,
    },
    METRICS: '/admin/metrics',
  },
  
  // User
  USER: {
    HOME: '/user',
    SURVEY: '/user/survey',
    THANK_YOU: '/user/thank-you',
  },
} as const;
