import React from 'react';
import type { Pregunta } from '../types/encuesta';

interface PreguntaComponentProps {
  pregunta: Pregunta;
  respuesta: any;
  onRespuestaChange: (valor: any) => void;
}

export const PreguntaComponent: React.FC<PreguntaComponentProps> = ({ 
  pregunta, 
  respuesta, 
  onRespuestaChange 
}) => {
  const handleChange = (valor: any) => {
    onRespuestaChange(valor);
  };

  const renderOpcionUnica = () => (
    <div className="option-group">
      {pregunta.opcionesRespuesta.map((opcion, index) => (
        <div key={index} className="option-item">
          <input
            type="radio"
            id={`${pregunta.idPregunta}-${index}`}
            name={`pregunta_${pregunta.idPregunta}`}
            value={opcion.valor || opcion.etiqueta}
            checked={respuesta === (opcion.valor || opcion.etiqueta)}
            onChange={(e) => handleChange(e.target.value)}
            className="option-input"
          />
          <label htmlFor={`${pregunta.idPregunta}-${index}`} className="option-label">
            <div className="option-indicator"></div>
            {opcion.etiqueta}
          </label>
        </div>
      ))}
    </div>
  );

  const renderOpcionMultiple = () => (
    <div className="option-group">
      {pregunta.opcionesRespuesta.map((opcion, index) => (
        <div key={index} className="option-item option-checkbox">
          <input
            type="checkbox"
            id={`${pregunta.idPregunta}-${index}`}
            value={opcion.valor || opcion.etiqueta}
            checked={Array.isArray(respuesta) && respuesta.includes(opcion.valor || opcion.etiqueta)}
            onChange={(e) => {
              const valor = e.target.value;
              const nuevasRespuestas = Array.isArray(respuesta) ? [...respuesta] : [];
              if (e.target.checked) {
                nuevasRespuestas.push(valor);
              } else {
                const index = nuevasRespuestas.indexOf(valor);
                if (index > -1) {
                  nuevasRespuestas.splice(index, 1);
                }
              }
              handleChange(nuevasRespuestas);
            }}
            className="option-input"
          />
          <label htmlFor={`${pregunta.idPregunta}-${index}`} className="option-label">
            <div className="option-indicator"></div>
            {opcion.etiqueta}
          </label>
        </div>
      ))}
    </div>
  );

  const renderEscala = () => (
    <div className="scale-container">
      {pregunta.opcionesRespuesta.map((opcion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleChange(opcion.valor || opcion.etiqueta)}
          className={`scale-button ${respuesta === (opcion.valor || opcion.etiqueta) ? 'selected' : ''}`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );

  const renderNPS = () => {
    const opciones = Array.from({ length: 11 }, (_, i) => i);
    
    return (
      <div>
        <div className="scale-container">
          {opciones.map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => handleChange(valor)}
              className={`scale-button ${respuesta === valor ? 'selected' : ''}`}
            >
              {valor}
            </button>
          ))}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '10px',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>Muy poco probable</span>
          <span>Muy probable</span>
        </div>
      </div>
    );
  };

  const renderAbierta = () => (
    <textarea
      value={respuesta || ''}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Escribe tu respuesta aquí..."
      className="text-input"
    />
  );

  return (
    <div className="question-container">
      <h3 className="question-title">
        {pregunta.contenido}
        {pregunta.esObligatoria && <span style={{ color: '#e53e3e' }}> *</span>}
      </h3>
      
      {pregunta.tipoPregunta === 'opcion_unica' && renderOpcionUnica()}
      {pregunta.tipoPregunta === 'opcion_multiple' && renderOpcionMultiple()}
      {pregunta.tipoPregunta === 'escala' && renderEscala()}
      {pregunta.tipoPregunta === 'nps' && renderNPS()}
      {pregunta.tipoPregunta === 'abierta' && renderAbierta()}
    </div>
  );
};