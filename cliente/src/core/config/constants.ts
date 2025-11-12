/**
 * Application Constants
 * Constantes globales de la aplicación
 * Principio: Avoid Magic Numbers/Strings
 */

export const APP_CONFIG = {
  NAME: 'MAGNETO Embeddable Tool',
  DESCRIPTION: 'Sistema de Gestión de Encuestas para Candidatos',
  VERSION: '2.0.0',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'magneto_auth_token',
  USER_DATA: 'magneto_user_data',
  THEME: 'magneto_theme',
} as const;

export const QUESTION_TYPES = {
  TEXT: 'text',
  RATING: 'rating',
  YES_NO: 'yesno',
  LIST: 'list',
  MULTIPLE: 'multiple',
} as const;

export const SURVEY_TYPES = {
  APPLICATION: 'application',
  ABANDONMENT: 'abandonment',
  CUSTOM: 'custom',
} as const;

export const SURVEY_STATUS = {
  DRAFT: 'borrador',
  ACTIVE: 'activa',
  INACTIVE: 'inactiva',
  ARCHIVED: 'archivada',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const RESPONSE_STATUS = {
  COMPLETED: 'completed',
  PARTIAL: 'partial',
  NOT_ANSWERED: 'not_answered',
} as const;

export const RATING_SCALE = {
  MIN: 1,
  MAX: 5,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;
