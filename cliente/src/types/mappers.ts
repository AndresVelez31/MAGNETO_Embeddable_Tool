// Utilidades para mapear entre los tipos del frontend (survey.ts) y backend (encuesta.ts)
import type { Survey, Question, QuestionType } from './survey';
import type { Encuesta, Pregunta } from './encuesta';

// Mapeo de tipos de pregunta: Backend -> Frontend
export function mapBackendQuestionTypeToFrontend(backendType: Pregunta['tipoPregunta']): QuestionType {
  const typeMap: Record<Pregunta['tipoPregunta'], QuestionType> = {
    'abierta': 'text',
    'opcion_unica': 'list',
    'opcion_multiple': 'list',
    'escala': 'rating',
    'nps': 'rating',
  };
  return typeMap[backendType] || 'text';
}

// Mapeo de tipos de pregunta: Frontend -> Backend
export function mapFrontendQuestionTypeToBackend(frontendType: QuestionType): Pregunta['tipoPregunta'] {
  const typeMap: Record<QuestionType, Pregunta['tipoPregunta']> = {
    'text': 'abierta',
    'list': 'opcion_unica',
    'yesno': 'opcion_unica',
    'rating': 'escala',
  };
  return typeMap[frontendType];
}

// Helper para convertir estado de Survey a Encuesta
const mapStatusToEstado = (status?: string): 'borrador' | 'activa' | 'inactiva' | 'archivada' => {
  if (!status) return 'borrador';
  
  const statusMap: Record<string, 'borrador' | 'activa' | 'inactiva' | 'archivada'> = {
    'draft': 'borrador',
    'active': 'activa',
    'inactive': 'inactiva',
    'borrador': 'borrador',
    'activa': 'activa',
    'inactiva': 'inactiva',
    'archivada': 'archivada'
  };
  
  return statusMap[status] || 'borrador';
};

// Convertir Encuesta (backend) a Survey (frontend)
export function mapEncuestaToSurvey(encuesta: Encuesta): Survey {
  return {
    id: encuesta._id || '',
    name: encuesta.nombreEncuesta || 'Sin nombre',
    description: `Encuesta de ${encuesta.tipoEncuesta || 'tipo desconocido'}`,
    type: encuesta.tipoEncuesta || 'custom',
    status: encuesta.estado || 'borrador',
    company: encuesta.empresaRelacionada || undefined,
    version: '1.0',
    questions: (encuesta.preguntas || []).map((pregunta): Question => ({
      id: pregunta.idPregunta || '',
      text: pregunta.contenido || '',
      type: mapBackendQuestionTypeToFrontend(pregunta.tipoPregunta),
      required: pregunta.esObligatoria ?? false,
      options: (pregunta.opcionesRespuesta || []).map(opt => opt.etiqueta || '').filter(Boolean),
    })),
    createdAt: encuesta.creadaEn?.toString() || encuesta.ultimaModificacion?.toString() || new Date().toISOString(),
    updatedAt: encuesta.actualizadaEn?.toString() || encuesta.ultimaModificacion?.toString(),
  };
}

// Convertir Survey (frontend) a datos para crear/actualizar Encuesta (backend)
export function mapSurveyToEncuestaData(survey: Partial<Survey>) {
  return {
    nombreEncuesta: survey.name || 'Sin nombre',
    tipoEncuesta: survey.type || 'custom',
    empresaRelacionada: survey.company,
    estado: mapStatusToEstado(survey.status),
    preguntas: survey.questions?.map((question): Pregunta => ({
      idPregunta: question.id,
      contenido: question.text,
      tipoPregunta: mapFrontendQuestionTypeToBackend(question.type),
      opcionesRespuesta: question.options?.map((opt, index) => ({
        etiqueta: opt,
        valor: opt.toLowerCase().replace(/\s+/g, '_'),
        orden: index + 1,
      })) || [],
      esObligatoria: question.required,
    })) || [],
  };
}
