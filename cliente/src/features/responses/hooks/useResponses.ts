/**
 * Responses Hook
 * Hook para gestión de respuestas de encuestas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/core/services/http-client';
import { API_ENDPOINTS } from '@/core/config/api.config';
import { responseService } from '../services/response.service';
import { toast } from 'sonner';
import type { Response, ResponseApiResponse } from '../types/response.types';

// ============================================
// QUERIES - Obtener datos
// ============================================

/**
 * Hook para obtener todas las respuestas
 */
export function useResponses() {
  return useQuery({
    queryKey: ['responses'],
    queryFn: async () => {
      const response = await httpClient.get<ResponseApiResponse>(API_ENDPOINTS.RESPONSES.BASE);
      console.log('🔍 Response from API:', response);
      console.log('🔍 Is array?', Array.isArray(response));
      console.log('🔍 Has data property?', 'data' in response);
      // El httpClient ya retorna el objeto {mensaje, count, data}
      // Necesitamos extraer solo el array de data
      return (response as any).data || response;
    },
    staleTime: 0, // Datos se consideran obsoletos inmediatamente
    refetchOnMount: true, // Recargar cuando se monta el componente
    refetchOnWindowFocus: true, // Recargar cuando la ventana obtiene foco
  });
}

/**
 * Hook para obtener una respuesta por ID
 */
export function useResponse(id: string) {
  return useQuery({
    queryKey: ['response', id],
    queryFn: async () => {
      const response = await httpClient.get<{ mensaje: string; data: Response }>(
        API_ENDPOINTS.RESPONSES.BY_ID(id)
      );
      // El httpClient ya retorna el objeto {mensaje, data}
      return (response as any).data || response;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener respuestas de una encuesta específica
 */
export function useResponsesBySurvey(surveyId: string) {
  return useQuery({
    queryKey: ['responses', 'survey', surveyId],
    queryFn: async () => {
      const response = await httpClient.get<ResponseApiResponse>(
        API_ENDPOINTS.RESPONSES.BY_SURVEY(surveyId)
      );
      return (response as any).data || response;
    },
    enabled: !!surveyId,
  });
}

/**
 * Hook para obtener respuestas de un usuario específico
 */
export function useResponsesByUser(userId: string) {
  return useQuery({
    queryKey: ['responses', 'user', userId],
    queryFn: async () => {
      const response = await httpClient.get<ResponseApiResponse>(
        API_ENDPOINTS.RESPONSES.BY_USER(userId)
      );
      return (response as any).data || response;
    },
    enabled: !!userId,
  });
}

// ============================================
// MUTATIONS - Enviar/Modificar datos
// ============================================

/**
 * Hook para enviar respuestas de encuesta
 */
export function useSubmitResponse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      surveyId,
      userId,
      answers,
      isAnonymous = false,
      estado = 'completada'
    }: {
      surveyId: string;
      userId: string;
      answers: Record<string, string | number | string[]>;
      isAnonymous?: boolean;
      estado?: 'completada' | 'parcial';
    }) => responseService.submitSurveyResponse(surveyId, userId, answers, isAnonymous, estado),
    onSuccess: () => {
      // Invalidar todas las queries de respuestas para que se recarguen
      queryClient.invalidateQueries({ queryKey: ['responses'] });
      toast.success('Respuestas enviadas exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error submitting response:', error);
      toast.error(error.message || 'Error al enviar las respuestas');
    },
  });
}

/**
 * Hook para registrar que no se respondió
 */
export function useRegisterNoResponse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ surveyId, userId }: { surveyId: string; userId: string }) => 
      responseService.registerNoResponse(surveyId, userId),
    onSuccess: () => {
      // Invalidar todas las queries de respuestas para que se recarguen
      queryClient.invalidateQueries({ queryKey: ['responses'] });
      toast.info('Registro guardado');
    },
    onError: (error: Error) => {
      console.error('Error registering no response:', error);
    },
  });
}
