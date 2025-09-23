import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const UsuarioSchema = new Schema({
  nombre: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  edad: { type: Number },
  tipoDocumento: { type: String, enum: ['CC','CE','PAS','NIT','OTRO'], default: 'CC' },
  documento: { type: String, unique: true, sparse: true },
  correoElectronico: { type: String, unique: true, required: true },
  contraseña: { type: String, required: true }
}, {
  timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
  versionKey: false
});

UsuarioSchema.virtual('idUsuario').get(function () { return this._id; });

// Hash de la contraseña
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contraseña')) return next();
  this.contraseña = await bcrypt.hash(this.contraseña, 10);
  next();
});

export const Usuario = model('Usuario', UsuarioSchema, 'usuario');
