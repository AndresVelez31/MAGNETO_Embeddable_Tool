import React, { useState, useEffect } from 'react';
import type { Encuesta, Pregunta, CrearEncuestaRequest } from '../types/encuesta';
import { encuestaService } from '../services/encuestaService';
import { EditorPreguntas } from './EditorPreguntas';

interface Props {
  encuestaInicial?: Encuesta;
  esEdicion?: boolean;
  onEncuestaCreada: (encuesta: Encuesta) => void;
  onCancelar: () => void;
}

export const CrearEncuesta: React.FC<Props> = ({ 
  encuestaInicial, 
  esEdicion = false, 
  onEncuestaCreada, 
  onCancelar 
}) => {
  const [nombreEncuesta, setNombreEncuesta] = useState('');
  const [tipoEncuesta, setTipoEncuesta] = useState('');
  const [empresaRelacionada, setEmpresaRelacionada] = useState('');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (encuestaInicial) {
      setNombreEncuesta(encuestaInicial.nombreEncuesta);
      setTipoEncuesta(encuestaInicial.tipoEncuesta);
      setEmpresaRelacionada(encuestaInicial.empresaRelacionada || '');
      setPreguntas(encuestaInicial.preguntas);
    }
  }, [encuestaInicial]);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombreEncuesta.trim() || !tipoEncuesta.trim()) {
      setError('El nombre y tipo de encuesta son obligatorios');
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      let encuestaResultado: Encuesta;
      
      if (esEdicion && encuestaInicial?._id) {
        encuestaResultado = await encuestaService.actualizarEncuesta(encuestaInicial._id, {
          nombreEncuesta,
          tipoEncuesta,
          empresaRelacionada: empresaRelacionada || undefined,
          preguntas
        });
      } else {
        const nuevaEncuesta: CrearEncuestaRequest = {
          nombreEncuesta,
          tipoEncuesta,
          empresaRelacionada: empresaRelacionada || undefined,
          preguntas
        };
        encuestaResultado = await encuestaService.crearEncuesta(nuevaEncuesta);
      }
      
      onEncuestaCreada(encuestaResultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la encuesta');
    } finally {
      setGuardando(false);
    }
  };

  const tiposDeEncuesta = [
    { valor: 'postulacion', etiqueta: 'Postulación' },
    { valor: 'abandono', etiqueta: 'Abandono' },
    { valor: 'satisfaccion', etiqueta: 'Satisfacción' },
    { valor: 'feedback', etiqueta: 'Feedback' },
    { valor: 'evaluacion', etiqueta: 'Evaluación' }
  ];

  return (
    <div className="crear-encuesta">
      <div className="crear-encuesta-header">
        <h2>{esEdicion ? 'Editar Encuesta' : 'Crear Nueva Encuesta'}</h2>
        <button 
          type="button" 
          onClick={onCancelar}
          className="btn-cancelar"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={manejarSubmit} className="formulario-encuesta">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="nombreEncuesta">
            Nombre de la Encuesta *
          </label>
          <input
            type="text"
            id="nombreEncuesta"
            value={nombreEncuesta}
            onChange={(e) => setNombreEncuesta(e.target.value)}
            placeholder="Ej: Encuesta de Satisfacción del Cliente"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipoEncuesta">
            Tipo de Encuesta *
          </label>
          <select
            id="tipoEncuesta"
            value={tipoEncuesta}
            onChange={(e) => setTipoEncuesta(e.target.value)}
            required
          >
            <option value="">Selecciona un tipo</option>
            {tiposDeEncuesta.map(tipo => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="empresaRelacionada">
            Empresa Relacionada (opcional)
          </label>
          <input
            type="text"
            id="empresaRelacionada"
            value={empresaRelacionada}
            onChange={(e) => setEmpresaRelacionada(e.target.value)}
            placeholder="Ej: ACME Corporation"
          />
        </div>

        <div className="form-section">
          <h3>Preguntas de la Encuesta</h3>
          <EditorPreguntas
            preguntas={preguntas}
            onPreguntasChange={setPreguntas}
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancelar}
            className="btn-secundario"
            disabled={guardando}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="btn-primario"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Crear')} Encuesta
          </button>
        </div>
      </form>
    </div>
  );
};