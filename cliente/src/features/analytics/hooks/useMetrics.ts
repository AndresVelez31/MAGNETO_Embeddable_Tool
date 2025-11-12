/**
 * Analytics Hooks
 * Hooks para métricas y análisis
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

/**
 * Hook para obtener métricas
 */
export function useMetrics(dias: number = 30) {
  return useQuery({
    queryKey: ['metrics', dias],
    queryFn: () => analyticsService.getMetrics(dias),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
