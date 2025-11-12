export type QuestionType = 'text' | 'list' | 'yesno' | 'rating';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
}

export interface Survey {
  id: string;
  name: string;
  description?: string;
  type: string; // Tipo flexible para coincidir con tipoEncuesta del backend
  company?: string; // empresaRelacionada
  status?: 'active' | 'inactive' | 'draft' | 'borrador' | 'activa' | 'inactiva' | 'archivada';
  questions: Question[];
  createdAt: string;
  updatedAt?: string;
  version?: string; // Nueva propiedad para la versión
}

export interface SurveyResponse {
  surveyId: string;
  userId: string;
  answers: Record<string, string | number | string[]>;
  submittedAt: string;
  status?: 'completed' | 'partial' | 'not_answered';
  rating?: 'good' | 'regular' | 'bad';
  anonymous?: boolean;
}

