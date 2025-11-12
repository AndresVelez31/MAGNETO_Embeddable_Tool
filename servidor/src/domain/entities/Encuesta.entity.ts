/**
 * Encuesta Entity
 * Entidad de dominio que representa una encuesta
 * Principio: Domain-Driven Design
 */

export interface Pregunta {
  idPregunta?: string;
  textoPregunta: string;
  tipoPregunta: 'text' | 'rating' | 'yesno' | 'list' | 'multiple';
  opciones?: string[];
  esObligatoria: boolean;
}

export interface Encuesta {
  _id?: string;
  tipoEncuesta: 'application' | 'abandonment' | 'custom';
  nombreEncuesta: string;
  empresaRelacionada?: string;
  preguntas: Pregunta[];
  estado: 'borrador' | 'activa' | 'inactiva' | 'archivada';
  creadaEn: Date;
  ultimaModificacion: Date;
}

export class EncuestaEntity {
  private _id?: string;
  private _tipoEncuesta: string;
  private _nombreEncuesta: string;
  private _empresaRelacionada?: string;
  private _preguntas: Pregunta[];
  private _estado: string;
  private _creadaEn: Date;
  private _ultimaModificacion: Date;

  constructor(data: Partial<Encuesta>) {
    this._id = data._id;
    this._tipoEncuesta = data.tipoEncuesta || 'custom';
    this._nombreEncuesta = data.nombreEncuesta || '';
    this._empresaRelacionada = data.empresaRelacionada;
    this._preguntas = data.preguntas || [];
    this._estado = data.estado || 'borrador';
    this._creadaEn = data.creadaEn || new Date();
    this._ultimaModificacion = data.ultimaModificacion || new Date();
  }

  // Getters
  get id(): string | undefined { return this._id; }
  get tipoEncuesta(): string { return this._tipoEncuesta; }
  get nombreEncuesta(): string { return this._nombreEncuesta; }
  get empresaRelacionada(): string | undefined { return this._empresaRelacionada; }
  get preguntas(): Pregunta[] { return this._preguntas; }
  get estado(): string { return this._estado; }
  get creadaEn(): Date { return this._creadaEn; }
  get ultimaModificacion(): Date { return this._ultimaModificacion; }

  // Métodos de dominio
  activar(): void {
    if (this._preguntas.length === 0) {
      throw new Error('No se puede activar una encuesta sin preguntas');
    }
    this._estado = 'activa';
    this.actualizarFechaModificacion();
  }

  desactivar(): void {
    this._estado = 'inactiva';
    this.actualizarFechaModificacion();
  }

  archivar(): void {
    this._estado = 'archivada';
    this.actualizarFechaModificacion();
  }

  agregarPregunta(pregunta: Pregunta): void {
    this._preguntas.push(pregunta);
    this.actualizarFechaModificacion();
  }

  eliminarPregunta(idPregunta: string): void {
    this._preguntas = this._preguntas.filter(p => p.idPregunta !== idPregunta);
    this.actualizarFechaModificacion();
  }

  private actualizarFechaModificacion(): void {
    this._ultimaModificacion = new Date();
  }

  // Convertir a objeto plano
  toObject(): Encuesta {
    return {
      _id: this._id,
      tipoEncuesta: this._tipoEncuesta as any,
      nombreEncuesta: this._nombreEncuesta,
      empresaRelacionada: this._empresaRelacionada,
      preguntas: this._preguntas,
      estado: this._estado as any,
      creadaEn: this._creadaEn,
      ultimaModificacion: this._ultimaModificacion,
    };
  }
}
