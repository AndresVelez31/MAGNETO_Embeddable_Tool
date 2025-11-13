/**
 * Routes Configuration
 * Configuración centralizada de rutas de la aplicación
 * Principio: Single Source of Truth
 */

export const ROUTES = {
  // Public
  LOGIN: '/login',
  
  // Public Survey (para modo embebido)
  SURVEY: '/survey',
  
  // Admin
  ADMIN: {
    HOME: '/admin',
    SURVEYS: {
      LIST: '/admin/surveys',
      CREATE: '/admin/surveys/create',
      DETAIL: (id: string) => `/admin/surveys/${id}`,
      EDIT: (id: string) => `/admin/surveys/${id}/edit`,
    },
    RESPONSES: {
      LIST: '/admin/responses',
      DETAIL: (id: string) => `/admin/responses/${id}`,
    },
    METRICS: '/admin/metrics',
  },
  
  // User
  USER: {
    HOME: '/user',
    SURVEY: '/user/survey',
  },
} as const;
