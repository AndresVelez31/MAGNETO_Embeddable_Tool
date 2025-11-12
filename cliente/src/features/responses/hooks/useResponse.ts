/**
 * Response Hooks
 * Hooks para manejo de respuestas
 */

import { useMutation } from '@tanstack/react-query';
import { responseService } from '../services/response.service';
import { toast } from 'sonner';

/**
 * Hook para enviar respuestas de encuesta
 */
export function useSubmitResponse() {
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
  return useMutation({
    mutationFn: ({ surveyId, userId }: { surveyId: string; userId: string }) => 
      responseService.registerNoResponse(surveyId, userId),
    onSuccess: () => {
      toast.info('Registro guardado');
    },
    onError: (error: Error) => {
      console.error('Error registering no response:', error);
    },
  });
}
