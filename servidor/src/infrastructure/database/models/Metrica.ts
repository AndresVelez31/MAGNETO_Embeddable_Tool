import { Schema, model } from "mongoose";

const MetricaSchema = new Schema({
  idEncuesta: { type: Schema.Types.ObjectId, ref: 'Encuesta', required: true },
  contenido: { type: Schema.Types.Mixed, required: true }   // JSON con KPI, conteos, promedios, etc.
}, {
  timestamps: { createdAt: 'creadaEn', updatedAt: 'actualizadaEn' },
  versionKey: false
});

MetricaSchema.virtual('idMetrica').get(function () { return this._id; });

MetricaSchema.index({ idEncuesta: 1, creadaEn: -1 });

export const Metrica = model('Metrica', MetricaSchema, 'metrica');
