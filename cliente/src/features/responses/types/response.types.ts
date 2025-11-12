/**
 * Response Types
 * Tipos para manejo de respuestas de encuestas
 */

export interface Response {
  _id?: string;
  id?: string;
  idEncuesta: string;
  idUsuario?: string;
  respuestasItem: ResponseItem[];
  estado?: 'completada' | 'parcial' | 'no_respondida';
  anonimo?: boolean;
  fechaEnvio?: Date | string;
  creadaEn?: Date | string;
  completada?: boolean;
}

export interface ResponseItem {
  idPregunta: string;
  respuesta: string | number | string[];
}

export interface CreateResponseDTO {
  idEncuesta: string;
  idUsuario?: string;
  respuestasItem: ResponseItem[];
  estado?: 'completada' | 'parcial';
  anonimo?: boolean;
  fechaEnvio?: string;
}

export interface ResponseFormData {
  [questionId: string]: string | number | string[];
}
