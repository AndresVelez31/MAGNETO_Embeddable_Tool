/**
 * Encuesta Repository Implementation
 * Implementación concreta del repositorio de encuestas usando Mongoose
 * Principio: Dependency Inversion (SOLID) - Implementa la interfaz del dominio
 */

import { Encuesta as EncuestaModel } from '../models/Encuesta';
import type { IEncuestaRepository, CreateEncuestaDTO, UpdateEncuestaDTO } from '../../../domain/interfaces/IEncuestaRepository';
import type { Encuesta, Pregunta } from '../../../domain/entities/Encuesta.entity';
import { Types } from 'mongoose';

/**
 * Mapper para convertir de Mongoose Document a Domain Entity
 */
function toDomain(doc: any): Encuesta {
  if (!doc) throw new Error('Document is null or undefined');
  
  // Mapear tipos de DB a frontend
  const tipoEncuestaMap: Record<string, string> = {
    'postulacion': 'application',
    'abandono': 'abandonment',
    'satisfaccion': 'custom',
  };
  
  return {
    _id: doc._id.toString(),
    nombreEncuesta: doc.nombreEncuesta,
    tipoEncuesta: tipoEncuestaMap[doc.tipoEncuesta] || doc.tipoEncuesta,
    empresaRelacionada: doc.empresaRelacionada || undefined,
    estado: doc.estado,
    preguntas: doc.preguntas.map((p: any): Pregunta => ({
      idPregunta: p.idPregunta,
      textoPregunta: p.contenido,
      tipoPregunta: mapTipoPregunta(p.tipoPregunta),
      opciones: p.opcionesRespuesta?.map((o: any) => o.etiqueta) || [],
      esObligatoria: true,
    })),
    ultimaModificacion: doc.ultimaModificacion || doc.actualizadaEn || new Date(),
    creadaEn: doc.creadaEn || doc.createdAt || new Date(),
  };
}

/**
 * Mapear tipos de pregunta de DB a dominio
 */
function mapTipoPregunta(tipo: string): Pregunta['tipoPregunta'] {
  const map: Record<string, Pregunta['tipoPregunta']> = {
    'opcion_unica': 'list',
    'opcion_multiple': 'multiple',
    'escala': 'rating',
    'nps': 'rating',
    'abierta': 'text',
  };
  return map[tipo] || 'text';
}

/**
 * Mapear tipos de pregunta de dominio a DB
 */
function mapTipoPreguntaToDB(tipo: Pregunta['tipoPregunta']): string {
  const map: Record<Pregunta['tipoPregunta'], string> = {
    'text': 'abierta',
    'rating': 'escala',
    'yesno': 'opcion_unica',
    'list': 'opcion_unica',
    'multiple': 'opcion_multiple',
  };
  return map[tipo] || 'abierta';
}

/**
 * Repositorio concreto de encuestas
 * Implementa la interfaz IEncuestaRepository usando Mongoose
 */
export class EncuestaRepository implements IEncuestaRepository {
  /**
   * Buscar encuesta por ID
   */
  async findById(id: string): Promise<Encuesta | null> {
    try {
      const doc = await EncuestaModel.findById(id).lean();
      return doc ? toDomain(doc) : null;
    } catch (error) {
      console.error('Error en findById:', error);
      return null;
    }
  }

  /**
   * Buscar todas las encuestas
   */
  async findAll(): Promise<Encuesta[]> {
    try {
      const docs = await EncuestaModel.find()
        .sort({ ultimaModificacion: -1 })
        .lean();
        
      return docs.map(toDomain);
    } catch (error) {
      console.error('Error en findAll:', error);
      return [];
    }
  }

  /**
   * Buscar encuestas por tipo
   */
  async findByType(tipo: string): Promise<Encuesta[]> {
    try {
      const docs = await EncuestaModel.find({ tipoEncuesta: tipo })
        .sort({ ultimaModificacion: -1 })
        .lean();
        
      return docs.map(toDomain);
    } catch (error) {
      console.error('Error en findByType:', error);
      return [];
    }
  }

  /**
   * Buscar encuesta activa por tipo (la más reciente)
   */
  async findActiveByType(tipo: string): Promise<Encuesta | null> {
    try {
      const doc = await EncuestaModel.findOne({
        tipoEncuesta: tipo,
        estado: 'activa',
      })
        .sort({ ultimaModificacion: -1 })
        .lean();
        
      return doc ? toDomain(doc) : null;
    } catch (error) {
      console.error('Error en findActiveByType:', error);
      return null;
    }
  }

  /**
   * Crear nueva encuesta
   */
  async create(data: CreateEncuestaDTO): Promise<Encuesta> {
    try {
      // Mapear tipos del frontend al backend
      const tipoEncuestaMapInverso: Record<string, string> = {
        'application': 'postulacion',
        'abandonment': 'abandono',
        'custom': 'satisfaccion',
      };
      
      const docData: any = {
        nombreEncuesta: data.nombreEncuesta,
        tipoEncuesta: tipoEncuestaMapInverso[data.tipoEncuesta] || data.tipoEncuesta,
        empresaRelacionada: data.empresaRelacionada,
        estado: 'borrador',
        preguntas: data.preguntas?.map((p: any) => ({
          idPregunta: p.idPregunta || new Types.ObjectId().toString(),
          contenido: p.textoPregunta || p.contenido,
          tipoPregunta: mapTipoPreguntaToDB(p.tipoPregunta),
          opcionesRespuesta: p.opciones?.map((etiqueta: string, index: number) => ({
            etiqueta,
            valor: etiqueta,
            orden: index,
          })) || [],
        })) || [],
        ultimaModificacion: new Date(),
      };
      
      const created = await EncuestaModel.create(docData);
      const populated = await EncuestaModel.findById(created._id).lean();
      
      if (!populated) {
        throw new Error('Error al recuperar la encuesta creada');
      }
      
      return toDomain(populated);
    } catch (error) {
      console.error('Error en create:', error);
      throw new Error(`Error al crear encuesta: ${error}`);
    }
  }

  /**
   * Actualizar encuesta existente
   */
  async update(id: string, data: UpdateEncuestaDTO): Promise<Encuesta | null> {
    try {
      const updateData: any = {
        ultimaModificacion: new Date(),
      };
      
      if (data.nombreEncuesta) updateData.nombreEncuesta = data.nombreEncuesta;
      if (data.empresaRelacionada !== undefined) updateData.empresaRelacionada = data.empresaRelacionada;
      if (data.estado) updateData.estado = data.estado;
      if (data.preguntas) {
        updateData.preguntas = data.preguntas.map((p: any) => ({
          idPregunta: p.idPregunta || new Types.ObjectId().toString(),
          contenido: p.textoPregunta || p.contenido,
          tipoPregunta: mapTipoPreguntaToDB(p.tipoPregunta),
          opcionesRespuesta: p.opciones?.map((etiqueta: string, index: number) => ({
            etiqueta,
            valor: etiqueta,
            orden: index,
          })) || [],
        }));
      }
      
      const updated = await EncuestaModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).lean();
      
      return updated ? toDomain(updated) : null;
    } catch (error) {
      console.error('Error en update:', error);
      throw new Error(`Error al actualizar encuesta: ${error}`);
    }
  }

  /**
   * Actualizar estado de encuesta
   */
  async updateStatus(id: string, estado: string): Promise<Encuesta | null> {
    try {
      const updated = await EncuestaModel.findByIdAndUpdate(
        id,
        { 
          $set: { 
            estado,
            ultimaModificacion: new Date(),
          },
        },
        { new: true, runValidators: true }
      ).lean();
      
      return updated ? toDomain(updated) : null;
    } catch (error) {
      console.error('Error en updateStatus:', error);
      return null;
    }
  }

  /**
   * Eliminar encuesta
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await EncuestaModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error en delete:', error);
      return false;
    }
  }

  /**
   * Contar encuestas por estado
   */
  async countByStatus(estado: string): Promise<number> {
    try {
      const count = await EncuestaModel.countDocuments({ estado });
      return count;
    } catch (error) {
      console.error('Error en countByStatus:', error);
      return 0;
    }
  }
}
