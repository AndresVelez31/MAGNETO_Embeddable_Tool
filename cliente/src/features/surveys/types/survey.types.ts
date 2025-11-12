/**
 * Survey Types
 * Tipos y DTOs para la gestión de encuestas
 * Principio: Strong Typing para seguridad y mantenibilidad
 */

// ============================================
// Survey Types
// ============================================

export interface Survey {
  _id?: string;
  id?: string;
  tipoEncuesta: 'application' | 'abandonment' | 'custom';
  nombreEncuesta: string;
  empresaRelacionada?: string;
  preguntas: Question[];
  estado: 'borrador' | 'activa' | 'inactiva' | 'archivada';
  creadaEn?: Date | string;
  ultimaModificacion?: Date | string;
}

export interface Question {
  idPregunta?: string;
  textoPregunta?: string;      // Frontend format
  contenido?: string;           // Backend format
  tipoPregunta: 'text' | 'list' | 'multiple' | 'rating'; // Tipos MAPEADOS desde backend
  opciones?: string[];          // Frontend format
  opcionesRespuesta?: Array<{   // Backend format
    etiqueta: string;
    valor: string;
    orden: number;
  }>;
  esObligatoria?: boolean;
}

// ============================================
// Data Transfer Objects (DTOs)
// ============================================

export interface CreateSurveyDTO {
  tipoEncuesta: string;
  nombreEncuesta: string;
  empresaRelacionada?: string;
  preguntas?: Question[];
}

export interface UpdateSurveyDTO {
  nombreEncuesta?: string;
  empresaRelacionada?: string;
  preguntas?: Question[];
  estado?: string;
}

export interface UpdateSurveyStatusDTO {
  estado: string;
}

// ============================================
// Form Types (para componentes)
// ============================================

export interface SurveyFormData {
  nombreEncuesta: string;
  tipoEncuesta: string;
  empresaRelacionada: string;
  preguntas: QuestionFormData[];
}

export interface QuestionFormData {
  id?: string;
  textoPregunta: string;
  tipoPregunta: string;
  opciones: string[];
  esObligatoria: boolean;
}

// ============================================
// Filter/Query Types
// ============================================

export interface SurveyFilters {
  tipo?: string;
  estado?: string;
  empresa?: string;
  searchTerm?: string;
}

export interface SurveyListParams {
  page?: number;
  limit?: number;
  filters?: SurveyFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
