import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface Clasificacion {
  cantidad: number;
  porcentaje: number;
  confianzaPromedio: number;
}

interface SentimientoGeneral {
  positivo: number;
  negativo: number;
  neutro: number;
}

interface MetricaData {
  idEncuesta: string;
  nombreEncuesta: string;
  totalRespuestas: number;
  clasificaciones: { [key: string]: Clasificacion };
  sentimientoGeneral: SentimientoGeneral;
  fechaAnalisis: string;
}

interface Metrica {
  _id: string;
  idEncuesta: string;
  contenido: MetricaData;
  creadaEn: string;
  actualizadaEn: string;
}

export const Dashboard: React.FC = () => {
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realMetrics, setRealMetrics] = useState<any | null>(null);

  useEffect(() => {
    cargarMetricas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarMetricas = async () => {
    try {
      setCargando(true);
      setError(null);

      // Obtener métricas reales (conteos y distribuciones)
      try {
        // Pedimos un periodo más amplio para incluir respuestas históricas
        // (antes se pedían solo 30 días y eso podía truncar el conteo a 3)
        const respReal = await fetch('http://localhost:3000/api/encuestas/analytics/metricas?dias=365');
        if (respReal.ok) {
          const jsonReal = await respReal.json();
          setRealMetrics(jsonReal);
        }
      } catch (e) {
        // ignore real metrics failure
      }

      // Intentar métricas generadas por servidor (si existen)
      try {
        const resp = await fetch('http://localhost:3000/api/encuestas/analytics/metricas/generadas');
        if (resp.ok) {
          const json = await resp.json();
          // Normalize expected shapes
          const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          if (items.length > 0) {
            const normalized = items.map((it: any) => it.metrica || it || {});
            setMetricas(normalized as Metrica[]);
            return;
          }
        }
      } catch (e) {
        // fall back to static below
      }

      // Fallback estático (demo)
      const ahora = new Date().toISOString();
      const staticMetricas: Metrica[] = [
        {
          _id: 'demo-enc-1',
          idEncuesta: 'enc-1',
          contenido: {
            idEncuesta: 'enc-1',
            nombreEncuesta: 'Encuesta de Satisfacción del Cliente (Demo)',
            totalRespuestas: 120,
            clasificaciones: {
              'satisfacción con el servicio': { cantidad: 42, porcentaje: 35, confianzaPromedio: 0.82 },
              'queja por mal funcionamiento': { cantidad: 14, porcentaje: 12, confianzaPromedio: 0.78 },
              'sugerencia de mejora': { cantidad: 24, porcentaje: 20, confianzaPromedio: 0.7 },
              'comentario neutro': { cantidad: 30, porcentaje: 25, confianzaPromedio: 0.5 },
              'problema técnico': { cantidad: 10, porcentaje: 8, confianzaPromedio: 0.65 }
            },
            sentimientoGeneral: { positivo: 54, negativo: 18, neutro: 48 },
            fechaAnalisis: ahora
          },
          creadaEn: ahora,
          actualizadaEn: ahora
        },
        {
          _id: 'demo-enc-2',
          idEncuesta: 'enc-2',
          contenido: {
            idEncuesta: 'enc-2',
            nombreEncuesta: 'Encuesta de Postulación a Empleo (Demo)',
            totalRespuestas: 48,
            clasificaciones: {
              'satisfacción con el servicio': { cantidad: 16, porcentaje: 33.3, confianzaPromedio: 0.8 },
              'comentario neutro': { cantidad: 20, porcentaje: 41.7, confianzaPromedio: 0.5 },
              'sugerencia de mejora': { cantidad: 8, porcentaje: 16.6, confianzaPromedio: 0.65 },
              'queja por mal funcionamiento': { cantidad: 4, porcentaje: 8.4, confianzaPromedio: 0.7 }
            },
            sentimientoGeneral: { positivo: 18, negativo: 6, neutro: 24 },
            fechaAnalisis: ahora
          },
          creadaEn: ahora,
          actualizadaEn: ahora
        },
        {
          _id: 'demo-enc-3',
          idEncuesta: 'enc-3',
          contenido: {
            idEncuesta: 'enc-3',
            nombreEncuesta: 'Encuesta de Abandono de Servicio (Demo)',
            totalRespuestas: 72,
            clasificaciones: {
              'experiencia negativa': { cantidad: 28, porcentaje: 38.9, confianzaPromedio: 0.76 },
              'comentario neutro': { cantidad: 30, porcentaje: 41.6, confianzaPromedio: 0.5 },
              'sugerencia de mejora': { cantidad: 14, porcentaje: 19.5, confianzaPromedio: 0.68 }
            },
            sentimientoGeneral: { positivo: 6, negativo: 28, neutro: 38 },
            fechaAnalisis: ahora
          },
          creadaEn: ahora,
          actualizadaEn: ahora
        }
      ];

      setMetricas(staticMetricas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas');
    } finally {
      setCargando(false);
    }
  };

  const obtenerColorSentimiento = (tipo: 'positivo' | 'negativo' | 'neutro'): string => {
    switch (tipo) {
      case 'positivo': return '#10b981';
      case 'negativo': return '#ef4444';
      case 'neutro': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (cargando) {
    return (
      <div className="dashboard">
        <div className="loading">
          <h2>🤖 Cargando Dashboard de IA...</h2>
          <p>Obteniendo métricas procesadas por inteligencia artificial</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <h2>❌ Error al cargar métricas</h2>
          <p>{error}</p>
          <button onClick={cargarMetricas} className="btn-reintentar">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🤖 Dashboard de Métricas IA</h1>
        <p>Análisis automático de respuestas usando inteligencia artificial</p>
      </header>

      {/* Sección: métricas reales (Respuestas por tipo y Estado de respuestas) */}
      {realMetrics && (
        <div className="metricas-grid" style={{ marginBottom: 20 }}>
          <div className="metrica-card">
            <div className="card-header">
              <h3>Respuestas por Tipo (datos reales)</h3>
            </div>
            <div style={{ paddingTop: 12 }}>
              {Array.isArray(realMetrics.respuestasPorTipo) && realMetrics.respuestasPorTipo.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {realMetrics.respuestasPorTipo.map((r: any) => (
                    <li key={r.tipo} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                      <span style={{ textTransform: 'capitalize' }}>{r.tipo}</span>
                      <span>{(r.completadas || 0) + (r.parciales || 0) + (r.abandonadas || 0)} respuestas</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay datos por tipo</p>
              )}
            </div>
          </div>

          <div className="metrica-card">
            <div className="card-header">
              <h3>Estado de Respuestas (datos reales)</h3>
            </div>
            <div style={{ paddingTop: 12 }}>
              {realMetrics.distribucionRespuestas ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span>Completadas</span>
                    <span>{realMetrics.distribucionRespuestas.completadas || 0}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span>Parciales</span>
                    <span>{realMetrics.distribucionRespuestas.parciales || 0}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span>No respondidas</span>
                    <span>{realMetrics.distribucionRespuestas.abandonadas || 0}</span>
                  </li>
                </ul>
              ) : (
                <p>No hay datos de estado</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="metricas-grid">
        {metricas.map((metrica) => (
          <div key={metrica._id} className="metrica-card">
            <div className="card-header">
              <h3>{metrica.contenido.nombreEncuesta}</h3>
              <span className="total-respuestas">
                {metrica.contenido.totalRespuestas} respuestas analizadas
              </span>
            </div>

            {/* Análisis de Sentimientos */}
            <div className="sentimientos-section">
              <h4>📊 Análisis de Sentimientos</h4>
              <div className="sentimientos-grid">
                <div className="sentimiento-item">
                  <span
                    className="sentimiento-indicator"
                    style={{ backgroundColor: obtenerColorSentimiento('positivo') }}
                  ></span>
                  <span className="sentimiento-label">Positivo</span>
                  <span className="sentimiento-valor">
                    {metrica.contenido.sentimientoGeneral.positivo}
                  </span>
                </div>
                <div className="sentimiento-item">
                  <span
                    className="sentimiento-indicator"
                    style={{ backgroundColor: obtenerColorSentimiento('neutro') }}
                  ></span>
                  <span className="sentimiento-label">Neutro</span>
                  <span className="sentimiento-valor">
                    {metrica.contenido.sentimientoGeneral.neutro}
                  </span>
                </div>
                <div className="sentimiento-item">
                  <span
                    className="sentimiento-indicator"
                    style={{ backgroundColor: obtenerColorSentimiento('negativo') }}
                  ></span>
                  <span className="sentimiento-label">Negativo</span>
                  <span className="sentimiento-valor">
                    {metrica.contenido.sentimientoGeneral.negativo}
                  </span>
                </div>
              </div>
            </div>

            {/* Clasificaciones Detalladas */}
            <div className="clasificaciones-section">
              <h4>🏷️ Clasificaciones IA</h4>
              <div className="clasificaciones-list">
                {Object.entries(metrica.contenido.clasificaciones).map(([clasificacion, datos]) => (
                  <div key={clasificacion} className="clasificacion-item">
                    <div className="clasificacion-header">
                      <span className="clasificacion-nombre">{clasificacion}</span>
                      <span className="clasificacion-porcentaje">
                        {datos.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                    <div className="clasificacion-detalles">
                      <span className="clasificacion-cantidad">
                        {datos.cantidad} respuestas
                      </span>
                      <span className="clasificacion-confianza">
                        Confianza: {(datos.confianzaPromedio * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="clasificacion-barra">
                      <div
                        className="clasificacion-progreso"
                        style={{ width: `${datos.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-footer">
              <span className="fecha-analisis">
                📅 Último análisis: {new Date(metrica.actualizadaEn).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;