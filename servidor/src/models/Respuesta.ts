import { Schema, model, Types } from "mongoose";

const RespuestaItemSchema = new Schema({
  // referencia a la pregunta embebida dentro de la encuesta
  idPregunta: { type: Schema.Types.ObjectId, required: true }, 
  // la respuesta como valor genérico (texto/número/opciones)
  respuesta: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const RespuestaSchema = new Schema({
  idEncuesta: { type: Schema.Types.ObjectId, ref: 'Encuesta', required: true },
  idUsuario:  { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  respuestasItem: { type: [RespuestaItemSchema], default: [] },  // ← array embebido
}, {
  timestamps: { createdAt: 'creadaEn', updatedAt: 'actualizadaEn' },
  versionKey: false
});

RespuestaSchema.virtual('idRespuesta').get(function () { return this._id; });

// Búsquedas típicas
RespuestaSchema.index({ idEncuesta: 1, creadaEn: -1 });
RespuestaSchema.index({ idUsuario: 1, creadaEn: -1 });

export const Respuesta = model('Respuesta', RespuestaSchema, 'respuesta');
