/**
 * Analytics Service
 * Servicio para métricas y análisis
 */

import { httpClient } from '@/core/services/http-client';
import { API_ENDPOINTS, API_CONFIG } from '@/core/config/api.config';
import type { MetricsData, MetricsQueryParams } from '../types/metrics.types';

export interface ExportMetricsParams {
  formato: 'csv' | 'pdf' | 'json';
  dias?: number;
  empresa?: string;
  area?: string;
}

class AnalyticsRepository {
  async getMetrics(params: MetricsQueryParams): Promise<MetricsData> {
    const queryString = params.dias ? `?dias=${params.dias}` : '';
    return httpClient.get<MetricsData>(
      `${API_ENDPOINTS.ANALYTICS.METRICS}${queryString}`
    );
  }

  async exportMetrics(params: ExportMetricsParams): Promise<Blob> {
    // Construir URL completa usando la misma configuración que httpClient
    const baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
    const url = `${baseURL}${API_ENDPOINTS.ANALYTICS.METRICS}/export`;
    
    console.log('📤 Exportando métricas a:', url);
    console.log('📋 Parámetros:', params);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    console.log('📥 Respuesta status:', response.status);
    console.log('📥 Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error al exportar métricas' }));
      throw new Error(error.error || 'Error al exportar métricas');
    }

    return response.blob();
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

  /**
   * Exportar métricas en el formato especificado
   */
  async exportMetrics(params: ExportMetricsParams): Promise<Blob> {
    const formatosValidos = ['csv', 'pdf', 'json'];
    
    if (!formatosValidos.includes(params.formato)) {
      throw new Error('Formato no válido. Use: csv, pdf o json');
    }

    if (params.dias && (params.dias < 1 || params.dias > 365)) {
      throw new Error('El período debe estar entre 1 y 365 días');
    }

    return this.repository.exportMetrics(params);
  }
}

// Singleton instance
const analyticsRepository = new AnalyticsRepository();
export const analyticsService = new AnalyticsService(analyticsRepository);
