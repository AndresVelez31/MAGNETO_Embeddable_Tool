/**
 * Respuesta Controller
 * Controlador HTTP para el módulo de respuestas
 * Principio: Single Responsibility - Solo maneja HTTP requests/responses
 */

import { Request, Response, NextFunction } from 'express';
import { Respuesta as RespuestaModel } from '../../database/models/Respuesta';
import { Encuesta as EncuestaModel } from '../../database/models/Encuesta';
import { Types } from 'mongoose';

export class RespuestaController {
  /**
   * Crear una nueva respuesta
   * POST /api/respuestas
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        idEncuesta, 
        idUsuario, 
        respuestasItem, 
        anonimo = false,
        estado = 'completada' 
      } = req.body;

      // Validaciones
      if (!idEncuesta || !Types.ObjectId.isValid(idEncuesta)) {
        res.status(400).json({ 
          mensaje: 'ID de encuesta inválido o no proporcionado' 
        });
        return;
      }

      if (!idUsuario || idUsuario.trim() === '') {
        res.status(400).json({ 
          mensaje: 'ID de usuario es requerido' 
        });
        return;
      }

      if (!respuestasItem || !Array.isArray(respuestasItem)) {
        res.status(400).json({ 
          mensaje: 'respuestasItem debe ser un array' 
        });
        return;
      }

      // Verificar que la encuesta existe
      const encuesta = await EncuestaModel.findById(idEncuesta);
      if (!encuesta) {
        res.status(404).json({ mensaje: 'Encuesta no encontrada' });
        return;
      }

      // Verificar que la encuesta está activa
      if (encuesta.estado !== 'activa') {
        res.status(400).json({ 
          mensaje: 'La encuesta no está activa para recibir respuestas' 
        });
        return;
      }

      // Convertir respuestasItem al formato correcto
      // El schema ahora acepta Mixed types para idPregunta, no necesita conversión
      const respuestasFormateadas = respuestasItem.map((item: any) => ({
        idPregunta: item.idPregunta,
        respuesta: item.respuesta
      }));

      // Crear la respuesta
      const nuevaRespuesta = new RespuestaModel({
        idEncuesta: new Types.ObjectId(idEncuesta),
        idUsuario: anonimo ? 'anonymous' : idUsuario,
        respuestasItem: respuestasFormateadas
      });

      const respuestaGuardada = await nuevaRespuesta.save();

      console.log(`✅ Respuesta guardada: ${respuestaGuardada._id} para encuesta ${idEncuesta}`);
      console.log(`   Estado: ${estado}, Anónimo: ${anonimo}, Items: ${respuestasFormateadas.length}`);

      res.status(201).json({
        mensaje: 'Respuesta guardada exitosamente',
        data: respuestaGuardada
      });
    } catch (error) {
      console.error('❌ Error al crear respuesta:', error);
      next(error);
    }
  }

  /**
   * Registrar que el usuario no respondió
   * POST /api/respuestas/no-respondio/:surveyId/:userId
   */
  async registerNoResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { surveyId, userId } = req.params;

      // Validaciones
      if (!surveyId || !Types.ObjectId.isValid(surveyId)) {
        res.status(400).json({ mensaje: 'ID de encuesta inválido' });
        return;
      }

      if (!userId || userId.trim() === '') {
        res.status(400).json({ mensaje: 'ID de usuario requerido' });
        return;
      }

      // Verificar que la encuesta existe
      const encuesta = await EncuestaModel.findById(surveyId);
      if (!encuesta) {
        res.status(404).json({ mensaje: 'Encuesta no encontrada' });
        return;
      }

      // Crear respuesta vacía para indicar "no respondió"
      const respuestaNoRespondio = new RespuestaModel({
        idEncuesta: new Types.ObjectId(surveyId),
        idUsuario: userId,
        respuestasItem: [] // Array vacío indica que no respondió
      });

      const respuestaGuardada = await respuestaNoRespondio.save();

      console.log(`📝 Registrado "no respondió": Usuario ${userId} - Encuesta ${surveyId}`);

      res.status(201).json({
        mensaje: 'Registro de no respuesta guardado',
        data: respuestaGuardada
      });
    } catch (error) {
      console.error('❌ Error al registrar no respuesta:', error);
      next(error);
    }
  }

  /**
   * Obtener respuestas por usuario
   * GET /api/respuestas/usuario/:userId
   */
  async getByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId || userId.trim() === '') {
        res.status(400).json({ mensaje: 'ID de usuario requerido' });
        return;
      }

      const respuestas = await RespuestaModel.find({ idUsuario: userId })
        .populate('idEncuesta', 'nombreEncuesta tipoEncuesta empresaRelacionada')
        .sort({ creadaEn: -1 });

      res.json({
        mensaje: 'Respuestas obtenidas exitosamente',
        count: respuestas.length,
        data: respuestas
      });
    } catch (error) {
      console.error('❌ Error al obtener respuestas por usuario:', error);
      next(error);
    }
  }

  /**
   * Obtener respuestas por encuesta
   * GET /api/respuestas/encuesta/:surveyId
   */
  async getBySurvey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { surveyId } = req.params;

      if (!surveyId || !Types.ObjectId.isValid(surveyId)) {
        res.status(400).json({ mensaje: 'ID de encuesta inválido' });
        return;
      }

      const respuestas = await RespuestaModel.find({ idEncuesta: surveyId })
        .sort({ creadaEn: -1 });

      // Separar respuestas completas de "no respondió"
      const completas = respuestas.filter(r => r.respuestasItem.length > 0);
      const noRespondieron = respuestas.filter(r => r.respuestasItem.length === 0);

      res.json({
        mensaje: 'Respuestas obtenidas exitosamente',
        total: respuestas.length,
        completas: completas.length,
        noRespondieron: noRespondieron.length,
        data: respuestas
      });
    } catch (error) {
      console.error('❌ Error al obtener respuestas por encuesta:', error);
      next(error);
    }
  }

  /**
   * Obtener una respuesta por ID
   * GET /api/respuestas/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ mensaje: 'ID de respuesta inválido' });
        return;
      }

      const respuesta = await RespuestaModel.findById(id)
        .populate('idEncuesta', 'nombreEncuesta tipoEncuesta empresaRelacionada preguntas');

      if (!respuesta) {
        res.status(404).json({ mensaje: 'Respuesta no encontrada' });
        return;
      }

      res.json({
        mensaje: 'Respuesta obtenida exitosamente',
        data: respuesta
      });
    } catch (error) {
      console.error('❌ Error al obtener respuesta:', error);
      next(error);
    }
  }

  /**
   * Obtener estadísticas de respuestas
   * GET /api/respuestas/stats/general
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalRespuestas = await RespuestaModel.countDocuments();
      const respuestasCompletas = await RespuestaModel.countDocuments({
        respuestasItem: { $exists: true, $ne: [] }
      });
      const noRespondieron = await RespuestaModel.countDocuments({
        respuestasItem: { $exists: true, $eq: [] }
      });

      // Respuestas anónimas
      const anonimas = await RespuestaModel.countDocuments({
        idUsuario: 'anonymous'
      });

      res.json({
        mensaje: 'Estadísticas obtenidas exitosamente',
        data: {
          total: totalRespuestas,
          completas: respuestasCompletas,
          noRespondieron,
          anonimas,
          identificadas: totalRespuestas - anonimas
        }
      });
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      next(error);
    }
  }
}
