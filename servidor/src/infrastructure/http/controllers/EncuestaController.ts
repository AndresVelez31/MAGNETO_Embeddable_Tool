/**
 * Encuesta Controller
 * Controlador HTTP para manejo de endpoints de encuestas
 * Principio: Single Responsibility - Solo maneja HTTP requests/responses
 * Patrón: Controller (GRASP)
 */

import { Request, Response, NextFunction } from 'express';
import { EncuestaService } from '../../../domain/services/EncuestaService';
import { EncuestaRepository } from '../../database/repositories/EncuestaRepository';
import { Encuesta as EncuestaModel } from '../../database/models/Encuesta';
import { Respuesta as RespuestaModel } from '../../database/models/Respuesta';

/**
 * Controlador de encuestas
 * Orquesta las operaciones HTTP y delega la lógica al servicio de dominio
 */
export class EncuestaController {
  private encuestaService: EncuestaService;

  constructor() {
    // Dependency Injection: Inyectar el repositorio al servicio
    const repository = new EncuestaRepository();
    this.encuestaService = new EncuestaService(repository);
  }

  /**
   * GET /api/encuestas
   * Obtener todas las encuestas
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const encuestas = await this.encuestaService.getAllEncuestas();
      res.json({
        mensaje: 'Encuestas obtenidas exitosamente',
        count: encuestas.length,
        data: encuestas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/encuestas/:id
   * Obtener encuesta por ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const encuesta = await this.encuestaService.getEncuestaById(id);
      res.json(encuesta);
    } catch (error: any) {
      if (error.message.includes('no encontrada')) {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/encuestas/tipo/:tipo
   * Obtener encuestas por tipo
   */
  async getByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = req.params;
      
      // Mapear tipos del frontend al backend
      // En la DB se usa: postulacion, abandono, satisfaccion
      const tipoMap: Record<string, string> = {
        'application': 'postulacion',
        'postulacion': 'postulacion',
        'abandonment': 'abandono',
        'abandono': 'abandono',
        'desercion': 'abandono', // desercion -> abandono en DB
        'satisfaction': 'satisfaccion',
        'satisfaccion': 'satisfaccion',
        'custom': 'custom',
      };
      
      const tipoMapeado = tipoMap[tipo.toLowerCase()] || tipo;
      
      const repository = new EncuestaRepository();
      const encuestas = await repository.findByType(tipoMapeado);
      res.json(encuestas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/encuestas/tipo/:tipo/activa
   * Obtener encuesta activa por tipo
   */
  async getActiveByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = req.params;
      
      // Mapear tipos del frontend al backend
      // En la DB se usa: postulacion, abandono, satisfaccion
      const tipoMap: Record<string, string> = {
        'application': 'postulacion',
        'postulacion': 'postulacion',
        'abandonment': 'abandono',
        'abandono': 'abandono',
        'desercion': 'abandono', // desercion -> abandono en DB
        'satisfaction': 'satisfaccion',
        'satisfaccion': 'satisfaccion',
        'custom': 'custom',
      };
      
      const tipoMapeado = tipoMap[tipo.toLowerCase()] || tipo;
      
      const encuesta = await this.encuestaService.getActiveEncuestaByType(tipoMapeado);
      res.json(encuesta);
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/encuestas
   * Crear nueva encuesta
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const encuesta = await this.encuestaService.createEncuesta(data);
      res.status(201).json(encuesta);
    } catch (error: any) {
      if (error.message.includes('requerido') || error.message.includes('inválid')) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PUT /api/encuestas/:id
   * Actualizar encuesta existente
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      const encuesta = await this.encuestaService.updateEncuesta(id, data);
      res.json(encuesta);
    } catch (error: any) {
      if (error.message.includes('no encontrada')) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message.includes('requerido') || error.message.includes('inválid')) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /api/encuestas/:id/estado
   * Actualizar estado de encuesta
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!estado) {
        res.status(400).json({ message: 'El campo estado es requerido' });
        return;
      }
      
      const encuesta = await this.encuestaService.updateEstadoEncuesta(id, estado);
      res.json(encuesta);
    } catch (error: any) {
      if (error.message.includes('no encontrada')) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message.includes('inválido') || error.message.includes('activ')) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/encuestas/:id
   * Eliminar encuesta
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.encuestaService.deleteEncuesta(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('no encontrada')) {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/encuestas/stats/estado
   * Obtener estadísticas por estado
   */
  async getStatsByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repository = new EncuestaRepository();
      const stats = {
        borrador: await repository.countByStatus('borrador'),
        activa: await repository.countByStatus('activa'),
        inactiva: await repository.countByStatus('inactiva'),
        archivada: await repository.countByStatus('archivada'),
      };
      
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/encuestas/analytics/metricas
   * Obtener métricas y estadísticas de encuestas
   */
  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dias = '30' } = req.query;
      const diasNumero = parseInt(dias as string);
      
      // Calcular fecha límite
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasNumero);
      
      // Total de respuestas en el período
      const totalRespuestas = await RespuestaModel.countDocuments({
        creadaEn: { $gte: fechaLimite }
      });
      
      // Respuestas completadas (con al menos 1 respuesta)
      const respuestasCompletas = await RespuestaModel.countDocuments({
        creadaEn: { $gte: fechaLimite },
        respuestasItem: { $exists: true, $ne: [] }
      });
      
      // Respuestas abandonadas
      const respuestasAbandonadas = await RespuestaModel.countDocuments({
        creadaEn: { $gte: fechaLimite },
        respuestasItem: { $size: 0 }
      });
      
      // Tasas
      const tasaCompletado = totalRespuestas > 0 
        ? parseFloat(((respuestasCompletas / totalRespuestas) * 100).toFixed(1)) 
        : 0.0;
      
      const tasaAbandono = totalRespuestas > 0 
        ? parseFloat(((respuestasAbandonadas / totalRespuestas) * 100).toFixed(1)) 
        : 0.0;
      
      // Encuestas activas
      const encuestasActivas = await EncuestaModel.countDocuments({ estado: 'activa' });
      
      // Respuestas por tipo de encuesta (usando tipos de DB)
      const tiposDB = ['postulacion', 'abandono', 'satisfaccion'];
      const tiposFrontend = ['postulacion', 'desercion', 'satisfaccion'];
      
      const dataPorTipo = await Promise.all(tiposDB.map(async (tipoDB, index) => {
        const encuestasTipo = await EncuestaModel.find({ tipoEncuesta: tipoDB }, '_id preguntas');
        
        let completadas = 0;
        let parciales = 0;
        let abandonadas = 0;
        
        for (const encuesta of encuestasTipo) {
          const totalPreguntas = encuesta.preguntas?.length || 0;
          
          completadas += await RespuestaModel.countDocuments({
            idEncuesta: encuesta._id,
            creadaEn: { $gte: fechaLimite },
            respuestasItem: { $exists: true, $ne: [] },
            $expr: { $eq: [{ $size: "$respuestasItem" }, totalPreguntas] }
          });
          
          if (totalPreguntas > 0) {
            parciales += await RespuestaModel.countDocuments({
              idEncuesta: encuesta._id,
              creadaEn: { $gte: fechaLimite },
              $expr: { 
                $and: [
                  { $gt: [{ $size: "$respuestasItem" }, 0] },
                  { $lt: [{ $size: "$respuestasItem" }, totalPreguntas] }
                ]
              }
            });
          }
          
          abandonadas += await RespuestaModel.countDocuments({
            idEncuesta: encuesta._id,
            creadaEn: { $gte: fechaLimite },
            respuestasItem: { $size: 0 }
          });
        }
        
        return {
          tipo: tiposFrontend[index], // Retornar tipo del frontend
          completadas,
          parciales,
          abandonadas
        };
      }));
      
      // Distribución de estados de respuestas
      const distribucionRespuestas = {
        completadas: respuestasCompletas,
        parciales: totalRespuestas - respuestasCompletas - respuestasAbandonadas,
        abandonadas: respuestasAbandonadas
      };
      
      // Clasificación de satisfacción (ejemplo simple)
      const satisfaccionBuena = Math.floor(respuestasCompletas * 0.6);
      const satisfaccionRegular = Math.floor(respuestasCompletas * 0.3);
      const satisfaccionMala = respuestasCompletas - satisfaccionBuena - satisfaccionRegular;
      
      const distribucionSatisfaccion = {
        buena: satisfaccionBuena,
        regular: satisfaccionRegular,
        mala: satisfaccionMala
      };
      
      res.json({
        periodo: {
          dias: diasNumero,
          desde: fechaLimite.toISOString(),
          hasta: new Date().toISOString()
        },
        resumen: {
          totalRespuestas,
          respuestasCompletas,
          respuestasAbandonadas,
          tasaCompletado,
          tasaAbandono,
          encuestasActivas
        },
        respuestasPorTipo: dataPorTipo,
        distribucionRespuestas,
        distribucionSatisfaccion
      });
      
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      next(error);
    }
  }
}
