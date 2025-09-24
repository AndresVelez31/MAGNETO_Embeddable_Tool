import { Schema, model, Types } from "mongoose";

const OpcionSchema = new Schema({
  etiqueta: { type: String, required: true },
  valor: { type: String },
  orden: { type: Number, default: 0 }
}, { _id: true });

const PreguntaSchema = new Schema({
  idPregunta: { type: String, default: () => new Types.ObjectId().toString() },
  contenido: { type: String, required: true },
  tipoPregunta: { type: String, enum: ['opcion_unica','opcion_multiple','escala','nps','abierta'], required: true },
  opcionesRespuesta: { type: [OpcionSchema], default: [] }
}, { _id: false });

const EncuestaSchema = new Schema({
  tipoEncuesta: { type: String, required: true },            // ej: postulacion, abandono, satisfaccion
  empresaRelacionada: { type: String },                      // o ObjectId si luego creas "Empresa"
  estado: { type: String, enum: ['borrador','activa','inactiva','archivada'], default: 'borrador' },
  nombreEncuesta: { type: String, required: true },
  ultimaModificacion: { type: Date, default: Date.now },
  preguntas: { type: [PreguntaSchema], default: [] }
}, {
  timestamps: { createdAt: 'creadaEn', updatedAt: 'actualizadaEn' },
  versionKey: false
});

// Virtual para exponer _id como idEncuesta
EncuestaSchema.virtual('idEncuesta').get(function () { return this._id; });

// Índices útiles
EncuestaSchema.index({ tipoEncuesta: 1, estado: 1 });
EncuestaSchema.index({ nombreEncuesta: 1 });

export const Encuesta = model('Encuesta', EncuestaSchema, 'encuesta');
