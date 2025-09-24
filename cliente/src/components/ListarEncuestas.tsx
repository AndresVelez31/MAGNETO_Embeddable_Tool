import React from 'react';
import type { Encuesta } from '../types/encuesta';

interface Props {
  encuestas: Encuesta[];
  onEliminar: (id: string) => void;
  onCambiarEstado: (id: string, estado: Encuesta['estado']) => void;
  onEditar: (encuesta: Encuesta) => void;
}

export const ListarEncuestas: React.FC<Props> = ({ 
  encuestas, 
  onEliminar, 
  onCambiarEstado, 
  onEditar 
}) => {
  const formatearFecha = (fecha: Date | string) => {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerClaseEstado = (estado: Encuesta['estado']) => {
    const clases = {
      borrador: 'estado-borrador',
      activa: 'estado-activa',
      inactiva: 'estado-inactiva',
      archivada: 'estado-archivada'
    };
    return clases[estado];
  };

  const obtenerEtiquetaEstado = (estado: Encuesta['estado']) => {
    const etiquetas = {
      borrador: 'Borrador',
      activa: 'Activa',
      inactiva: 'Inactiva',
      archivada: 'Archivada'
    };
    return etiquetas[estado];
  };

  const estadosDisponibles: Encuesta['estado'][] = ['borrador', 'activa', 'inactiva', 'archivada'];

  if (encuestas.length === 0) {
    return (
      <div className="lista-vacia">
        <h3>No hay encuestas creadas</h3>
        <p>Crea tu primera encuesta para comenzar a recolectar datos.</p>
      </div>
    );
  }

  return (
    <div className="listar-encuestas">
      <div className="listar-header">
        <h2>Encuestas ({encuestas.length})</h2>
      </div>

      <div className="encuestas-grid">
        {encuestas.map((encuesta) => (
          <div key={encuesta._id} className="encuesta-card">
            <div className="encuesta-header">
              <h3 className="encuesta-titulo">{encuesta.nombreEncuesta}</h3>
              <span className={`estado-badge ${obtenerClaseEstado(encuesta.estado)}`}>
                {obtenerEtiquetaEstado(encuesta.estado)}
              </span>
            </div>

            <div className="encuesta-info">
              <p className="encuesta-tipo">
                <strong>Tipo:</strong> {encuesta.tipoEncuesta}
              </p>
              {encuesta.empresaRelacionada && (
                <p className="encuesta-empresa">
                  <strong>Empresa:</strong> {encuesta.empresaRelacionada}
                </p>
              )}
              <p className="encuesta-preguntas">
                <strong>Preguntas:</strong> {encuesta.preguntas.length}
              </p>
              <p className="encuesta-fecha">
                <strong>Última modificación:</strong> {formatearFecha(encuesta.ultimaModificacion)}
              </p>
            </div>

            <div className="encuesta-acciones">
              <button
                onClick={() => onEditar(encuesta)}
                className="btn-accion btn-editar"
                title="Editar encuesta"
              >
                Editar
              </button>

              <div className="estado-selector">
                <select
                  value={encuesta.estado}
                  onChange={(e) => onCambiarEstado(encuesta._id!, e.target.value as Encuesta['estado'])}
                  className="select-estado"
                >
                  {estadosDisponibles.map(estado => (
                    <option key={estado} value={estado}>
                      {obtenerEtiquetaEstado(estado)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => onEliminar(encuesta._id!)}
                className="btn-accion btn-eliminar"
                title="Eliminar encuesta"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};