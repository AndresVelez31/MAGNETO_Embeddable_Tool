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

    // User requested fake metrics only — always fetch the fake endpoint.
    // This simplifies local demos and avoids depending on the IA pipeline.
    return await httpClient.get<MetricsData>(
      `${API_ENDPOINTS.ANALYTICS.METRICS}/fake${queryString}`
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

    // Use the repository to fetch the fake metrics payload, then
    // transform it into the `MetricsData` shape expected by the UI.
    const raw = await this.repository.getMetrics({ dias });

    // If the backend already returned the expected MetricsData shape
    // (from /encuestas/analytics/metricas), just return it.
    if ((raw as any).resumen && (raw as any).periodo) {
      return raw as MetricsData;
    }

    // Otherwise `raw` is expected to be the fake payload: { count, data: Metrica[] }
    const payload = (raw as any) || { count: 0, data: [] };
    const items: any[] = Array.isArray(payload.data) ? payload.data : [];

    const totalRespuestas = items.reduce((s, it) => s + ((it?.contenido?.totalRespuestas) || 0), 0);
    const respuestasCompletas = Math.round(totalRespuestas * 0.7);
    const respuestasAbandonadas = Math.round(totalRespuestas * 0.1);
    const parciales = Math.max(0, totalRespuestas - respuestasCompletas - respuestasAbandonadas);

    const tasaCompletado = totalRespuestas > 0 ? parseFloat(((respuestasCompletas / totalRespuestas) * 100).toFixed(1)) : 0;
    const tasaAbandono = totalRespuestas > 0 ? parseFloat(((respuestasAbandonadas / totalRespuestas) * 100).toFixed(1)) : 0;

    // Build a simple respuestasPorTipo by mapping the fake items to types
    const respuestasPorTipo = items.map(it => ({
      tipo: it.contenido?.nombreEncuesta?.toLowerCase?.() || 'custom',
      completadas: Math.round((it.contenido?.totalRespuestas || 0) * 0.6),
      parciales: Math.round((it.contenido?.totalRespuestas || 0) * 0.2),
      abandonadas: Math.round((it.contenido?.totalRespuestas || 0) * 0.2),
    }));

    const distribucionRespuestas = {
      completadas: respuestasCompletas,
      parciales: parciales,
      abandonadas: respuestasAbandonadas
    };

    const satisfaccionBuena = Math.round(respuestasCompletas * 0.6);
    const satisfaccionRegular = Math.round(respuestasCompletas * 0.3);
    const satisfaccionMala = Math.max(0, respuestasCompletas - satisfaccionBuena - satisfaccionRegular);

    const distribucionSatisfaccion = {
      buena: satisfaccionBuena,
      regular: satisfaccionRegular,
      mala: satisfaccionMala
    };

    let result: MetricsData = {
      periodo: {
        dias,
        desde: new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString(),
        hasta: new Date().toISOString()
      },
      resumen: {
        totalRespuestas,
        respuestasCompletas,
        respuestasAbandonadas,
        tasaCompletado,
        tasaAbandono,
        encuestasActivas: items.length
      },
      respuestasPorTipo,
      distribucionRespuestas,
      distribucionSatisfaccion
    };

    // Intentar obtener el conteo real de respuestas desde el endpoint de métricas
    // y escalar las métricas fake para que el total coincida con el real.
    try {
      const realRaw = await httpClient.get<any>(`${API_ENDPOINTS.ANALYTICS.METRICS}?dias=${dias}`);
      if (realRaw && realRaw.resumen && typeof realRaw.resumen.totalRespuestas === 'number') {
        const realTotal = realRaw.resumen.totalRespuestas;
        if (realTotal >= 0 && totalRespuestas > 0 && realTotal !== totalRespuestas) {
          const scale = realTotal / totalRespuestas;

          // Escalar resumen
          result.resumen.totalRespuestas = realTotal;
          result.resumen.respuestasCompletas = Math.round(result.resumen.respuestasCompletas * scale);
          result.resumen.respuestasAbandonadas = Math.round(result.resumen.respuestasAbandonadas * scale);
          result.resumen.encuestasActivas = result.resumen.encuestasActivas; // keep same count
          result.resumen.tasaCompletado = realTotal > 0 ? parseFloat(((result.resumen.respuestasCompletas / realTotal) * 100).toFixed(1)) : 0;
          result.resumen.tasaAbandono = realTotal > 0 ? parseFloat(((result.resumen.respuestasAbandonadas / realTotal) * 100).toFixed(1)) : 0;

          // Escalar distribuciones
          result.distribucionRespuestas = {
            completadas: result.distribucionRespuestas.completadas > 0 ? Math.round(result.distribucionRespuestas.completadas * scale) : 0,
            parciales: result.distribucionRespuestas.parciales > 0 ? Math.round(result.distribucionRespuestas.parciales * scale) : 0,
            abandonadas: result.distribucionRespuestas.abandonadas > 0 ? Math.round(result.distribucionRespuestas.abandonadas * scale) : 0,
          };

          // Escalar satisfaccion
          result.distribucionSatisfaccion = {
            buena: Math.round(result.distribucionSatisfaccion.buena * scale),
            regular: Math.round(result.distribucionSatisfaccion.regular * scale),
            mala: Math.max(0, Math.round(result.distribucionSatisfaccion.mala * scale))
          };

          // Ajustar respuestasPorTipo proporcionalmente
          result.respuestasPorTipo = result.respuestasPorTipo.map(r => ({
            ...r,
            completadas: Math.round((r.completadas || 0) * scale),
            parciales: Math.round((r.parciales || 0) * scale),
            abandonadas: Math.round((r.abandonadas || 0) * scale),
          }));
        }
      }
    } catch (e) {
      // Si falla la consulta real, devolvemos el resultado fake tal cual
    }

    return result;
  }
}

// Singleton instance
const analyticsRepository = new AnalyticsRepository();
export const analyticsService = new AnalyticsService(analyticsRepository);
