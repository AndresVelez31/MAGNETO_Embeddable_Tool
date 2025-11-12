/**
 * Survey Service
 * Servicio para gestión de encuestas (Admin)
 * Patrón: Service Layer + Repository
 * Principio SOLID: Single Responsibility, Dependency Inversion
 */

import { httpClient } from '@/core/services/http-client';
import { API_ENDPOINTS } from '@/core/config/api.config';
import type { 
  Survey, 
  CreateSurveyDTO, 
  UpdateSurveyDTO,
  UpdateSurveyStatusDTO 
} from '../types/survey.types';

/**
 * Repository Pattern - Abstrae el acceso a datos
 * Principio: Information Expert (GRASP)
 */
class SurveyRepository {
  async findAll(): Promise<Survey[]> {
    return httpClient.get<Survey[]>(API_ENDPOINTS.SURVEYS.BASE);
  }

  async findById(id: string): Promise<Survey> {
    return httpClient.get<Survey>(API_ENDPOINTS.SURVEYS.BY_ID(id));
  }

  async findByType(type: string): Promise<Survey> {
    // Usar el endpoint de encuesta activa por tipo para respuestas de usuarios
    return httpClient.get<Survey>(API_ENDPOINTS.SURVEYS.ACTIVE_BY_TYPE(type));
  }

  async create(data: CreateSurveyDTO): Promise<Survey> {
    return httpClient.post<Survey>(API_ENDPOINTS.SURVEYS.BASE, data);
  }

  async update(id: string, data: UpdateSurveyDTO): Promise<Survey> {
    return httpClient.put<Survey>(API_ENDPOINTS.SURVEYS.BY_ID(id), data);
  }

  async updateStatus(id: string, status: UpdateSurveyStatusDTO): Promise<Survey> {
    return httpClient.patch<Survey>(
      API_ENDPOINTS.SURVEYS.UPDATE_STATUS(id), 
      status
    );
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(API_ENDPOINTS.SURVEYS.BY_ID(id));
  }
}

/**
 * Service Layer - Lógica de negocio
 * Principio: Controller (GRASP), Single Responsibility (SOLID)
 */
class SurveyService {
  private repository: SurveyRepository;

  constructor(repository: SurveyRepository) {
    this.repository = repository;
  }

  /**
   * Obtener todas las encuestas
   */
  async getAllSurveys(): Promise<Survey[]> {
    return this.repository.findAll();
  }

  /**
   * Obtener encuesta por ID
   */
  async getSurveyById(id: string): Promise<Survey> {
    if (!id || id.trim() === '') {
      throw new Error('El ID de la encuesta es requerido');
    }
    return this.repository.findById(id);
  }

  /**
   * Obtener encuesta por tipo
   */
  async getSurveyByType(type: string): Promise<Survey> {
    if (!type || type.trim() === '') {
      throw new Error('El tipo de encuesta es requerido');
    }
    return this.repository.findByType(type);
  }

  /**
   * Crear nueva encuesta
   * Validaciones de negocio aplicadas
   */
  async createSurvey(data: CreateSurveyDTO): Promise<Survey> {
    // Validaciones de negocio
    this.validateSurveyData(data);

    return this.repository.create(data);
  }

  /**
   * Actualizar encuesta existente
   */
  async updateSurvey(id: string, data: UpdateSurveyDTO): Promise<Survey> {
    if (!id || id.trim() === '') {
      throw new Error('El ID de la encuesta es requerido');
    }

    // Validaciones de negocio si es necesario
    if (data.preguntas) {
      this.validateQuestions(data.preguntas);
    }

    return this.repository.update(id, data);
  }

  /**
   * Cambiar estado de encuesta
   */
  async updateSurveyStatus(id: string, status: string): Promise<Survey> {
    if (!id || id.trim() === '') {
      throw new Error('El ID de la encuesta es requerido');
    }

    const validStatuses = ['borrador', 'activa', 'inactiva', 'archivada'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    return this.repository.updateStatus(id, { estado: status });
  }

  /**
   * Eliminar encuesta
   */
  async deleteSurvey(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('El ID de la encuesta es requerido');
    }
    return this.repository.delete(id);
  }

  /**
   * Validar datos de encuesta (lógica de negocio)
   * @private
   */
  private validateSurveyData(data: CreateSurveyDTO): void {
    if (!data.nombreEncuesta || data.nombreEncuesta.trim() === '') {
      throw new Error('El nombre de la encuesta es requerido');
    }

    if (!data.tipoEncuesta || data.tipoEncuesta.trim() === '') {
      throw new Error('El tipo de encuesta es requerido');
    }

    if (data.preguntas && data.preguntas.length > 0) {
      this.validateQuestions(data.preguntas);
    }
  }

  /**
   * Validar preguntas
   * @private
   */
  private validateQuestions(preguntas: any[]): void {
    if (!Array.isArray(preguntas)) {
      throw new Error('Las preguntas deben ser un array');
    }

    preguntas.forEach((pregunta, index) => {
      if (!pregunta.textoPregunta || pregunta.textoPregunta.trim() === '') {
        throw new Error(`La pregunta ${index + 1} debe tener texto`);
      }

      if (!pregunta.tipoPregunta || pregunta.tipoPregunta.trim() === '') {
        throw new Error(`La pregunta ${index + 1} debe tener un tipo`);
      }

      const validTypes = ['text', 'rating', 'yesno', 'list', 'multiple'];
      if (!validTypes.includes(pregunta.tipoPregunta)) {
        throw new Error(
          `Tipo de pregunta inválido en la pregunta ${index + 1}. ` +
          `Debe ser uno de: ${validTypes.join(', ')}`
        );
      }

      // Validar que preguntas tipo list/multiple tengan opciones
      if (['list', 'multiple'].includes(pregunta.tipoPregunta)) {
        if (!pregunta.opciones || !Array.isArray(pregunta.opciones) || pregunta.opciones.length === 0) {
          throw new Error(
            `La pregunta ${index + 1} de tipo ${pregunta.tipoPregunta} debe tener opciones`
          );
        }
      }
    });
  }
}

// Singleton instances
// Principio: Creator (GRASP)
const surveyRepository = new SurveyRepository();
export const surveyService = new SurveyService(surveyRepository);
