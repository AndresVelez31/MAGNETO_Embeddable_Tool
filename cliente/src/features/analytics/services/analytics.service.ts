/**
 * Analytics Service
 * Servicio para métricas y análisis
 */

import { httpClient } from '@/core/services/http-client';
import { API_ENDPOINTS } from '@/core/config/api.config';
import type { MetricsData, MetricsQueryParams } from '../types/metrics.types';

class AnalyticsRepository {
  async getMetrics(params: MetricsQueryParams): Promise<MetricsData> {
    const queryString = params.dias ? `?dias=${params.dias}` : '';
    return httpClient.get<MetricsData>(
      `${API_ENDPOINTS.ANALYTICS.METRICS}${queryString}`
    );
  }
}

class AnalyticsService {
  private repository: AnalyticsRepository;

  constructor(repository: AnalyticsRepository) {
    this.repository = repository;
  }

  /**
   * Obtener métricas del período especificado
   */
  async getMetrics(dias: number = 30): Promise<MetricsData> {
    if (dias < 1 || dias > 365) {
      throw new Error('El período debe estar entre 1 y 365 días');
    }

    return this.repository.getMetrics({ dias });
  }
}

// Singleton instance
const analyticsRepository = new AnalyticsRepository();
export const analyticsService = new AnalyticsService(analyticsRepository);
