/**
 * Analytics Types
 * Tipos para métricas y análisis
 */

export interface MetricsData {
  periodo: {
    dias: number;
    desde: string;
    hasta: string;
  };
  resumen: MetricsSummary;
  respuestasPorTipo: ResponsesByType[];
  distribucionRespuestas: ResponseDistribution;
  distribucionSatisfaccion: SatisfactionDistribution;
}

export interface MetricsSummary {
  totalRespuestas: number;
  respuestasCompletas: number;
  respuestasAbandonadas: number;
  tasaCompletado: number;
  tasaAbandono: number;
  encuestasActivas: number;
  tiempoPromedio?: number;
  tasaRespuesta?: number;
  satisfaccionGeneral?: number;
}

export interface ResponsesByType {
  tipo: string;
  completadas: number;
  parciales: number;
  abandonadas: number;
}

export interface ResponseDistribution {
  completadas: number;
  parciales: number;
  abandonadas: number;
}

export interface SatisfactionDistribution {
  buena: number;
  regular: number;
  mala: number;
}

export interface MetricsQueryParams {
  dias?: number;
}
