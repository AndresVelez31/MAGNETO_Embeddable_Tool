/**
 * Response Service
 * Servicio para manejo de respuestas de encuestas
 * Patrón: Service Layer + Repository
 */

import { httpClient } from '@/core/services/http-client';
import { API_ENDPOINTS } from '@/core/config/api.config';
import type { Response, CreateResponseDTO, ResponseItem } from '../types/response.types';

class ResponseRepository {
  async create(data: CreateResponseDTO): Promise<Response> {
    return httpClient.post<Response>(API_ENDPOINTS.RESPONSES.BASE, data);
  }

  async findById(id: string): Promise<Response> {
    return httpClient.get<Response>(API_ENDPOINTS.RESPONSES.BY_ID(id));
  }

  async findByUser(userId: string): Promise<Response[]> {
    return httpClient.get<Response[]>(API_ENDPOINTS.RESPONSES.BY_USER(userId));
  }

  async findBySurvey(surveyId: string): Promise<Response[]> {
    return httpClient.get<Response[]>(API_ENDPOINTS.RESPONSES.BY_SURVEY(surveyId));
  }

  async registerNoResponse(surveyId: string, userId: string): Promise<void> {
    return httpClient.post<void>(
      API_ENDPOINTS.RESPONSES.NO_RESPONSE(surveyId, userId),
      {}
    );
  }
}

class ResponseService {
  private repository: ResponseRepository;

  constructor(repository: ResponseRepository) {
    this.repository = repository;
  }

  /**
   * Enviar respuestas de una encuesta
   */
  async submitSurveyResponse(
    surveyId: string,
    userId: string,
    answers: Record<string, string | number | string[]>,
    isAnonymous: boolean = false,
    estado: 'completada' | 'parcial' = 'completada'
  ): Promise<Response> {
    // Validar que hay respuestas
    if (!surveyId) {
      throw new Error('El ID de la encuesta es requerido');
    }
    
    if (!userId && !isAnonymous) {
      throw new Error('El ID del usuario es requerido para respuestas no anónimas');
    }

    if (!answers || Object.keys(answers).length === 0) {
      throw new Error('Debe responder al menos una pregunta');
    }

    // Convertir a formato de respuestas
    const respuestasItem: ResponseItem[] = Object.entries(answers).map(
      ([questionId, answer]) => ({
        idPregunta: questionId,
        respuesta: answer,
      })
    );

    const data: CreateResponseDTO = {
      idEncuesta: surveyId,
      idUsuario: isAnonymous ? 'anonymous' : userId,
      respuestasItem,
      anonimo: isAnonymous,
      estado,
      fechaEnvio: new Date().toISOString(),
    };

    return this.repository.create(data);
  }

  /**
   * Registrar que el usuario no respondió
   */
  async registerNoResponse(surveyId: string, userId: string): Promise<void> {
    if (!surveyId || surveyId.trim() === '') {
      throw new Error('El ID de la encuesta es requerido');
    }
    if (!userId || userId.trim() === '') {
      throw new Error('El ID del usuario es requerido');
    }

    return this.repository.registerNoResponse(surveyId, userId);
  }

  /**
   * Obtener respuestas por usuario
   */
  async getResponsesByUser(userId: string): Promise<Response[]> {
    if (!userId) {
      throw new Error('El ID del usuario es requerido');
    }
    return this.repository.findByUser(userId);
  }

  /**
   * Obtener respuestas por encuesta
   */
  async getResponsesBySurvey(surveyId: string): Promise<Response[]> {
    if (!surveyId) {
      throw new Error('El ID de la encuesta es requerido');
    }
    return this.repository.findBySurvey(surveyId);
  }
}

// Singleton instances
const responseRepository = new ResponseRepository();
export const responseService = new ResponseService(responseRepository);
