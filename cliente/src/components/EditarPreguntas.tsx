import React from 'react';
import type { Pregunta, Opcion } from '../types/encuesta';

interface Props {
  preguntas: Pregunta[];
  onPreguntasChange: (preguntas: Pregunta[]) => void;
}

export const EditorPreguntas: React.FC<Props> = ({ preguntas, onPreguntasChange }) => {
  const agregarPregunta = () => {
    const nuevaPregunta: Pregunta = {
      idPregunta: Math.random().toString(36).substr(2, 9),
      contenido: '',
      tipoPregunta: 'opcion_unica',
      opcionesRespuesta: []
    };
    onPreguntasChange([...preguntas, nuevaPregunta]);
  };

  const eliminarPregunta = (index: number) => {
    const nuevasPreguntas = preguntas.filter((_, i) => i !== index);
    onPreguntasChange(nuevasPreguntas);
  };

  const actualizarPregunta = (index: number, preguntaActualizada: Pregunta) => {
    const nuevasPreguntas = preguntas.map((pregunta, i) => 
      i === index ? preguntaActualizada : pregunta
    );
    onPreguntasChange(nuevasPreguntas);
  };

  const agregarOpcion = (indicePregunta: number) => {
    const pregunta = preguntas[indicePregunta];
    const nuevaOpcion: Opcion = {
      etiqueta: '',
      valor: '',
      orden: pregunta.opcionesRespuesta.length
    };
    
    const preguntaActualizada = {
      ...pregunta,
      opcionesRespuesta: [...pregunta.opcionesRespuesta, nuevaOpcion]
    };
    
    actualizarPregunta(indicePregunta, preguntaActualizada);
  };

  const eliminarOpcion = (indicePregunta: number, indiceOpcion: number) => {
    const pregunta = preguntas[indicePregunta];
    const opcionesActualizadas = pregunta.opcionesRespuesta.filter((_, i) => i !== indiceOpcion);
    
    const preguntaActualizada = {
      ...pregunta,
      opcionesRespuesta: opcionesActualizadas.map((opcion, i) => ({ ...opcion, orden: i }))
    };
    
    actualizarPregunta(indicePregunta, preguntaActualizada);
  };

  const actualizarOpcion = (indicePregunta: number, indiceOpcion: number, opcionActualizada: Opcion) => {
    const pregunta = preguntas[indicePregunta];
    const opcionesActualizadas = pregunta.opcionesRespuesta.map((opcion, i) => 
      i === indiceOpcion ? opcionActualizada : opcion
    );
    
    const preguntaActualizada = {
      ...pregunta,
      opcionesRespuesta: opcionesActualizadas
    };
    
    actualizarPregunta(indicePregunta, preguntaActualizada);
  };

  const tiposDePreguntas = [
    { valor: 'opcion_unica', etiqueta: 'Opción Única' },
    { valor: 'opcion_multiple', etiqueta: 'Opción Multiple' },
    { valor: 'escala', etiqueta: 'Escala' },
    { valor: 'nps', etiqueta: 'Net Promoter Score' },
    { valor: 'abierta', etiqueta: 'Respuesta Abierta' }
  ];

  const necesitaOpciones = (tipo: Pregunta['tipoPregunta']) => {
    return ['opcion_unica', 'opcion_multiple', 'escala'].includes(tipo);
  };

  return (
    <div className="editor-preguntas">
      {preguntas.map((pregunta, indicePregunta) => (
        <div key={pregunta.idPregunta} className="pregunta-item">
          <div className="pregunta-header">
            <h4>Pregunta {indicePregunta + 1}</h4>
            <button
              type="button"
              onClick={() => eliminarPregunta(indicePregunta)}
              className="btn-eliminar"
              title="Eliminar pregunta"
            >
              ×
            </button>
          </div>

          <div className="pregunta-form">
            <div className="form-group">
              <label>Contenido de la pregunta</label>
              <textarea
                value={pregunta.contenido}
                onChange={(e) => actualizarPregunta(indicePregunta, {
                  ...pregunta,
                  contenido: e.target.value
                })}
                placeholder="Escribe tu pregunta aquí..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Tipo de pregunta</label>
              <select
                value={pregunta.tipoPregunta}
                onChange={(e) => actualizarPregunta(indicePregunta, {
                  ...pregunta,
                  tipoPregunta: e.target.value as Pregunta['tipoPregunta'],
                  opcionesRespuesta: necesitaOpciones(e.target.value as Pregunta['tipoPregunta']) 
                    ? pregunta.opcionesRespuesta 
                    : []
                })}
              >
                {tiposDePreguntas.map(tipo => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            {necesitaOpciones(pregunta.tipoPregunta) && (
              <div className="opciones-section">
                <div className="opciones-header">
                  <label>Opciones de respuesta</label>
                  <button
                    type="button"
                    onClick={() => agregarOpcion(indicePregunta)}
                    className="btn-agregar-opcion"
                  >
                    + Agregar Opción
                  </button>
                </div>

                {pregunta.opcionesRespuesta.map((opcion, indiceOpcion) => (
                  <div key={indiceOpcion} className="opcion-item">
                    <input
                      type="text"
                      value={opcion.etiqueta}
                      onChange={(e) => actualizarOpcion(indicePregunta, indiceOpcion, {
                        ...opcion,
                        etiqueta: e.target.value,
                        valor: e.target.value
                      })}
                      placeholder={`Opción ${indiceOpcion + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => eliminarOpcion(indicePregunta, indiceOpcion)}
                      className="btn-eliminar-opcion"
                      title="Eliminar opción"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={agregarPregunta}
        className="btn-agregar-pregunta"
      >
        + Agregar Pregunta
      </button>
    </div>
  );
};