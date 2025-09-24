import React, { useState, useEffect } from 'react';
import type { Encuesta } from '../types/encuesta';
import { encuestaService } from '../services/encuestaService';
import { CrearEncuesta } from './CrearEncuesta';
import { ListarEncuestas } from './ListarEncuestas';
import './Administrador.css';

export const Administrador: React.FC = () => {
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [vistaActual, setVistaActual] = useState<'lista' | 'crear' | 'editar'>('lista');
  const [encuestaEditando, setEncuestaEditando] = useState<Encuesta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEncuestas();
  }, []);

  const cargarEncuestas = async () => {
    try {
      setCargando(true);
      setError(null);
      const encuestasData = await encuestaService.obtenerEncuestas();
      setEncuestas(encuestasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar encuestas');
    } finally {
      setCargando(false);
    }
  };

  const manejarEncuestaCreada = (nuevaEncuesta: Encuesta) => {
    setEncuestas(prev => [nuevaEncuesta, ...prev]);
    setVistaActual('lista');
  };

  const manejarEncuestaActualizada = (encuestaActualizada: Encuesta) => {
    setEncuestas(prev => 
      prev.map(enc => enc._id === encuestaActualizada._id ? encuestaActualizada : enc)
    );
    setVistaActual('lista');
    setEncuestaEditando(null);
  };

  const manejarEliminarEncuesta = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta encuesta?')) {
      return;
    }

    try {
      await encuestaService.eliminarEncuesta(id);
      setEncuestas(prev => prev.filter(enc => enc._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar encuesta');
    }
  };

  const manejarCambiarEstado = async (id: string, nuevoEstado: Encuesta['estado']) => {
    try {
      const encuestaActualizada = await encuestaService.cambiarEstadoEncuesta(id, { estado: nuevoEstado });
      setEncuestas(prev => 
        prev.map(enc => enc._id === id ? encuestaActualizada : enc)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  const manejarEditarEncuesta = (encuesta: Encuesta) => {
    setEncuestaEditando(encuesta);
    setVistaActual('editar');
  };

  const renderContenido = () => {
    if (cargando) {
      return <div className="loading">Cargando encuestas...</div>;
    }

    if (error) {
      return (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={cargarEncuestas}>Reintentar</button>
        </div>
      );
    }

    switch (vistaActual) {
      case 'crear':
        return (
          <CrearEncuesta
            onEncuestaCreada={manejarEncuestaCreada}
            onCancelar={() => setVistaActual('lista')}
          />
        );
      case 'editar':
        return encuestaEditando ? (
          <CrearEncuesta
            encuestaInicial={encuestaEditando}
            esEdicion={true}
            onEncuestaCreada={manejarEncuestaActualizada}
            onCancelar={() => {
              setVistaActual('lista');
              setEncuestaEditando(null);
            }}
          />
        ) : null;
      default:
        return (
          <ListarEncuestas
            encuestas={encuestas}
            onEliminar={manejarEliminarEncuesta}
            onCambiarEstado={manejarCambiarEstado}
            onEditar={manejarEditarEncuesta}
          />
        );
    }
  };

  return (
    <div className="administrador">
      <header className="administrador-header">
        <h1>Administrador de Encuestas</h1>
        <div className="administrador-nav">
          <button 
            className={`nav-btn ${vistaActual === 'lista' ? 'activo' : ''}`}
            onClick={() => {
              setVistaActual('lista');
              setEncuestaEditando(null);
            }}
          >
            Ver Encuestas ({encuestas.length})
          </button>
          <button 
            className={`nav-btn ${vistaActual === 'crear' ? 'activo' : ''}`}
            onClick={() => setVistaActual('crear')}
          >
            Crear Nueva Encuesta
          </button>
        </div>
      </header>
      
      <main className="administrador-content">
        {renderContenido()}
      </main>
    </div>
  );
};