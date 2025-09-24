export interface Opcion {
  _id?: string;
  etiqueta: string;
  valor?: string;
  orden: number;
}

export interface Pregunta {
  idPregunta: string;
  contenido: string;
  tipoPregunta: 'opcion_unica' | 'opcion_multiple' | 'escala' | 'nps' | 'abierta';
  opcionesRespuesta: Opcion[];
}

export interface Encuesta {
  _id?: string;
  idEncuesta?: string;
  tipoEncuesta: string;
  empresaRelacionada?: string;
  estado: 'borrador' | 'activa' | 'inactiva' | 'archivada';
  nombreEncuesta: string;
  ultimaModificacion: Date;
  preguntas: Pregunta[];
  creadaEn?: Date;
  actualizadaEn?: Date;
}

export interface CrearEncuestaRequest {
  tipoEncuesta: string;
  nombreEncuesta: string;
  empresaRelacionada?: string;
  preguntas?: Pregunta[];
}

export interface ActualizarEstadoRequest {
  estado: 'borrador' | 'activa' | 'inactiva' | 'archivada';
}