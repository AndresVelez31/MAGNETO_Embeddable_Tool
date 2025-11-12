/**
 * API Configuration
 * Configuración centralizada de endpoints y URLs de la API
 * Principio: Single Source of Truth
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  API_PREFIX: '/api',
  TIMEOUT: 30000, // 30 segundos
} as const;

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // Encuestas (Admin)
  SURVEYS: {
    BASE: '/encuestas',
    BY_ID: (id: string) => `/encuestas/${id}`,
    BY_TYPE: (type: string) => `/encuestas/tipo/${type}`,
    ACTIVE_BY_TYPE: (type: string) => `/encuestas/tipo/${type}/activa`,
    UPDATE_STATUS: (id: string) => `/encuestas/${id}/estado`,
  },
  
  // Respuestas (User)
  RESPONSES: {
    BASE: '/respuestas',
    BY_ID: (id: string) => `/respuestas/${id}`,
    BY_USER: (userId: string) => `/respuestas/usuario/${userId}`,
    BY_SURVEY: (surveyId: string) => `/respuestas/encuesta/${surveyId}`,
    NO_RESPONSE: (surveyId: string, userId: string) => `/respuestas/no-respondio/${surveyId}/${userId}`,
  },
  
  // Analytics (Admin)
  ANALYTICS: {
    METRICS: '/encuestas/analytics/metricas',
  },
  
  // Usuarios
  USERS: {
    BASE: '/usuarios',
    BY_ID: (id: string) => `/usuarios/${id}`,
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};
