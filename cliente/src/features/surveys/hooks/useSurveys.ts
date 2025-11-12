/**
 * Survey Hook
 * Hook personalizado para gestión de encuestas
 * Principio: Information Expert, Controller (GRASP)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyService } from '../services/survey.service';
import { toast } from 'sonner';
import type { CreateSurveyDTO, UpdateSurveyDTO } from '../types/survey.types';

/**
 * Hook para obtener todas las encuestas
 */
export function useSurveys() {
  return useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveyService.getAllSurveys(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener una encuesta por ID
 */
export function useSurvey(id: string) {
  return useQuery({
    queryKey: ['survey', id],
    queryFn: () => surveyService.getSurveyById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener encuesta por tipo
 */
export function useSurveyByType(type: string) {
  return useQuery({
    queryKey: ['survey', 'type', type],
    queryFn: () => surveyService.getSurveyByType(type),
    enabled: !!type,
  });
}

/**
 * Hook para mutaciones de encuestas (create, update, delete)
 */
export function useSurveyMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateSurveyDTO) => surveyService.createSurvey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Encuesta creada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error creating survey:', error);
      toast.error(error.message || 'Error al crear la encuesta');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyDTO }) =>
      surveyService.updateSurvey(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey', variables.id] });
      toast.success('Encuesta actualizada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error updating survey:', error);
      toast.error(error.message || 'Error al actualizar la encuesta');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      surveyService.updateSurveyStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey', variables.id] });
      toast.success('Estado actualizado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Error al actualizar el estado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => surveyService.deleteSurvey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Encuesta eliminada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error deleting survey:', error);
      toast.error(error.message || 'Error al eliminar la encuesta');
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    updateStatus: updateStatusMutation,
    delete: deleteMutation,
  };
}
