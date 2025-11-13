import React, { useState } from 'react';
import { ModalEncuesta } from './ModalEncuesta';
import './PortalCandidato.css';

const PortalCandidato: React.FC = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoEncuesta, setTipoEncuesta] = useState<'postulacion' | 'abandono' | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const manejarClick = (tipo: 'postulacion' | 'abandono') => {
    setTipoEncuesta(tipo);
    setMostrarModal(true);
    setMensaje(null);
  };

  const manejarCerrarModal = () => {
    setMostrarModal(false);
    setTipoEncuesta(null);
  };

  const manejarExitoEncuesta = () => {
    setMostrarModal(false);
    setMensaje({
      tipo: 'success',
      texto: tipoEncuesta === 'postulacion' 
        ? '¡Gracias! Tu postulación ha sido enviada exitosamente.' 
        : '¡Gracias por tu tiempo! Tu respuesta ha sido registrada.'
    });
    setTipoEncuesta(null);
  };

  const manejarErrorEncuesta = (error: string) => {
    setMensaje({ tipo: 'error', texto: error });
  };

  return (
    <div className="portal-candidato">
      <div className="portal-container">
        <h1 className="portal-title">Portal del Candidato</h1>
        <p className="portal-subtitle">
          Bienvenido al proceso de selección. Por favor, selecciona una opción para continuar con tu postulación.
        </p>
        
        <div className="buttons-container">
          <button
            className="btn btn-aplicar"
            onClick={() => manejarClick('postulacion')}
          >
            🚀 Aplicar al Puesto
          </button>
          
          <button
            className="btn btn-desertar"
            onClick={() => manejarClick('abandono')}
          >
            ❌ Desertar
          </button>
        </div>

        {mensaje && (
          <div className={mensaje.tipo === 'success' ? 'success-message' : 'error-message'}>
            {mensaje.texto}
          </div>
        )}
      </div>

      {mostrarModal && tipoEncuesta && (
        <ModalEncuesta
          tipoEncuesta={tipoEncuesta}
          isVisible={mostrarModal}
          onClose={manejarCerrarModal}
          onSuccess={manejarExitoEncuesta}
          onError={manejarErrorEncuesta}
        />
      )}
    </div>
  );
};

export default PortalCandidato;