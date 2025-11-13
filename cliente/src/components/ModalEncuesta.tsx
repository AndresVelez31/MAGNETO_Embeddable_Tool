import React, { useState, useEffect } from 'react';
import { encuestaService } from '../services/encuestaService';
import { PreguntaComponent } from './PreguntaComponent';
import type { Encuesta } from '../types/encuesta';
import './ModalEncuesta.css';

interface ModalEncuestaProps {
  tipoEncuesta: 'postulacion' | 'abandono';
  nombreVacante?: string;
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const ModalEncuesta: React.FC<ModalEncuestaProps> = ({
  tipoEncuesta,
  isVisible,
  onClose,
  onSuccess,
  onError
}) => {
  const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, any>>({});
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && tipoEncuesta) {
      cargarEncuesta();
    }
  }, [isVisible, tipoEncuesta]);

  const cargarEncuesta = async () => {
    try {
      setCargando(true);
      setError(null);
      const encuestaData = await encuestaService.obtenerEncuestaPorTipo(tipoEncuesta);
      setEncuesta(encuestaData);
      // Inicializar respuestas vacías
      const respuestasIniciales: Record<string, any> = {};
      encuestaData.preguntas.forEach(pregunta => {
        respuestasIniciales[pregunta.idPregunta] = pregunta.tipoPregunta === 'opcion_multiple' ? [] : '';
      });
      setRespuestas(respuestasIniciales);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar la encuesta';
      setError(mensaje);
      onError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioRespuesta = (idPregunta: string, valor: any) => {
    setRespuestas(prev => ({
      ...prev,
      [idPregunta]: valor
    }));
  };

  const calcularProgreso = () => {
    if (!encuesta) return { respondidas: 0, total: 0 };
    
    const total = encuesta.preguntas.length;
    const respondidas = encuesta.preguntas.filter(pregunta => {
      const respuesta = respuestas[pregunta.idPregunta];
      if (pregunta.tipoPregunta === 'opcion_multiple') {
        return Array.isArray(respuesta) && respuesta.length > 0;
      }
      return respuesta && respuesta.toString().trim() !== '';
    }).length;
    
    return { respondidas, total };
  };

  const todasPreguntasObligatoriasRespondidas = () => {
    if (!encuesta) return false;
    
    return encuesta.preguntas.every(pregunta => {
      const respuesta = respuestas[pregunta.idPregunta];
      if (pregunta.tipoPregunta === 'opcion_multiple') {
        return Array.isArray(respuesta) && respuesta.length > 0;
      }
      return respuesta && respuesta.toString().trim() !== '';
    });
  };

  const handleSubmit = async () => {
    if (!encuesta || !todasPreguntasObligatoriasRespondidas()) return;
    
    try {
      setEnviando(true);
      setError(null);
      
      await encuestaService.enviarRespuestas(
        encuesta._id!,
        Object.keys(respuestas).map(idPregunta => ({
          idPregunta,
          respuesta: respuestas[idPregunta]
        }))
      );
      
      onSuccess();
      onClose();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al enviar la encuesta';
      setError(mensaje);
      onError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = async () => {
    if (!encuesta) {
      onClose();
      return;
    }

    // Registrar que no respondió si cierra sin enviar
    try {
      await encuestaService.registrarNoRespuesta(encuesta._id!);
    } catch (err) {
      console.warn('Error al registrar no respuesta:', err);
    }
    
    onClose();
  };

  if (!isVisible) return null;

  const progreso = calcularProgreso();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            Encuesta de {tipoEncuesta === 'postulacion' ? 'Postulación' : 'Abandono'}
          </h2>
          
          {/* Progress */}
          {encuesta && (
            <div className="progress-container">
              <div className="progress-text">
                Pregunta {progreso.respondidas} de {progreso.total} ({Math.round((progreso.respondidas / progreso.total) * 100)}% completado)
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(progreso.respondidas / progreso.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <button className="close-button" onClick={handleClose} disabled={enviando}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {cargando && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid #e2e8f0', 
                borderTop: '3px solid #4299e1', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p>Cargando encuesta...</p>
            </div>
          )}

          {error && !cargando && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {encuesta && !cargando && (
            <div>
              {encuesta.preguntas.map((pregunta) => (
                <div key={pregunta.idPregunta} className="question-container">
                  <PreguntaComponent
                    pregunta={pregunta}
                    respuesta={respuestas[pregunta.idPregunta]}
                    onRespuestaChange={(valor) => manejarCambioRespuesta(pregunta.idPregunta, valor)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {encuesta && !cargando && (
          <div className="modal-footer">
            <button className="btn-secondary" onClick={handleClose} disabled={enviando}>
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSubmit} 
              disabled={enviando || !todasPreguntasObligatoriasRespondidas()}
            >
              {enviando ? 'Enviando...' : 'Enviar Respuestas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};