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
import { ExportService, MetricsExportData } from '../../../domain/services/ExportService';

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
      
      // Distribución de estados de respuestas - basada en dataPorTipo
      const completadasTotal = dataPorTipo.reduce((sum, item) => sum + item.completadas, 0);
      const parcialesTotal = dataPorTipo.reduce((sum, item) => sum + item.parciales, 0);
      const abandonadasTotal = dataPorTipo.reduce((sum, item) => sum + item.abandonadas, 0);
      
      const distribucionRespuestas = {
        completadas: completadasTotal,
        parciales: parcialesTotal,
        abandonadas: abandonadasTotal
      };
      
      // Calcular satisfacción basada en respuestas reales
      const distribucionSatisfaccion = await this.calcularDistribucionSatisfaccion(
        fechaLimite,
        undefined
      );
      
      // Calcular tiempo promedio de completado
      const tiempoPromedio = await this.calcularTiempoPromedio(
        fechaLimite,
        undefined
      );
      
      // Calcular tasa de respuesta real
      const tasaRespuesta = await this.calcularTasaRespuesta(
        fechaLimite,
        undefined
      );
      
      // Calcular satisfacción general (promedio de escala)
      const satisfaccionGeneral = await this.calcularSatisfaccionGeneral(
        fechaLimite,
        undefined
      );
      
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
          encuestasActivas,
          tiempoPromedio,
          tasaRespuesta,
          satisfaccionGeneral
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

  /**
   * POST /api/encuestas/analytics/metricas/export
   * Exportar métricas en diferentes formatos (CSV, PDF, JSON)
   */
  async exportMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📊 === EXPORTACIÓN DE MÉTRICAS ===');
      console.log('📥 Body recibido:', req.body);
      
      const { formato = 'json', dias = '30', empresa, area } = req.body;
      const diasNumero = parseInt(dias as string);
      
      console.log('📋 Formato:', formato);
      console.log('📅 Días:', diasNumero);
      console.log('🏢 Empresa:', empresa || 'Todas');
      console.log('🏗️ Área:', area || 'Todas');
      
      // Validar formato
      const formatosValidos = ['csv', 'pdf', 'json'];
      if (!formatosValidos.includes(formato.toLowerCase())) {
        console.log('❌ Formato no válido:', formato);
        res.status(400).json({
          error: 'Formato no válido. Use: csv, pdf o json'
        });
        return;
      }

      // Calcular fecha límite
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasNumero);
      
      // Construir filtros de búsqueda
      const filtrosBusqueda: any = {
        creadaEn: { $gte: fechaLimite }
      };

      // Agregar filtros opcionales
      // Nota: Los campos empresa y area no existen en el modelo actual
      // pero se mantienen para futura implementación
      if (empresa) {
        // Buscar encuestas con empresaRelacionada
        const encuestasEmpresa = await EncuestaModel.find({ 
          empresaRelacionada: empresa 
        }, '_id');
        
        if (encuestasEmpresa.length > 0) {
          const idsEncuestas = encuestasEmpresa.map(e => e._id);
          filtrosBusqueda.idEncuesta = { $in: idsEncuestas };
        }
      }

      if (area) {
        // El campo area no existe actualmente en el modelo
        // Por ahora, simplemente registramos el filtro pero no lo aplicamos
        console.log('Filtro por área solicitado pero no implementado:', area);
      }

      // Total de respuestas con filtros
      const totalRespuestas = await RespuestaModel.countDocuments(filtrosBusqueda);
      
      // Respuestas completadas
      const respuestasCompletas = await RespuestaModel.countDocuments({
        ...filtrosBusqueda,
        respuestasItem: { $exists: true, $ne: [] }
      });
      
      // Respuestas abandonadas
      const respuestasAbandonadas = await RespuestaModel.countDocuments({
        ...filtrosBusqueda,
        respuestasItem: { $size: 0 }
      });
      
      // Tasas
      const tasaCompletado = totalRespuestas > 0 
        ? parseFloat(((respuestasCompletas / totalRespuestas) * 100).toFixed(1)) 
        : 0.0;
      
      const tasaAbandono = totalRespuestas > 0 
        ? parseFloat(((respuestasAbandonadas / totalRespuestas) * 100).toFixed(1)) 
        : 0.0;
      
      // Encuestas activas con filtros
      const filtrosEncuestas: any = { estado: 'activa' };
      if (empresa) filtrosEncuestas.empresaRelacionada = empresa;
      const encuestasActivas = await EncuestaModel.countDocuments(filtrosEncuestas);
      
      // Respuestas por tipo
      const tiposDB = ['postulacion', 'abandono', 'satisfaccion'];
      const tiposFrontend = ['postulacion', 'desercion', 'satisfaccion'];
      
      const dataPorTipo = await Promise.all(tiposDB.map(async (tipoDB, index) => {
        const filtrosEncuestaTipo: any = { tipoEncuesta: tipoDB };
        if (empresa) filtrosEncuestaTipo.empresaRelacionada = empresa;
        
        const encuestasTipo = await EncuestaModel.find(filtrosEncuestaTipo, '_id preguntas');
        
        let completadas = 0;
        let parciales = 0;
        let abandonadas = 0;
        
        for (const encuesta of encuestasTipo) {
          const totalPreguntas = encuesta.preguntas?.length || 0;
          const filtroEncuesta = {
            ...filtrosBusqueda,
            idEncuesta: encuesta._id
          };
          
          completadas += await RespuestaModel.countDocuments({
            ...filtroEncuesta,
            respuestasItem: { $exists: true, $ne: [] },
            $expr: { $eq: [{ $size: "$respuestasItem" }, totalPreguntas] }
          });
          
          if (totalPreguntas > 0) {
            parciales += await RespuestaModel.countDocuments({
              ...filtroEncuesta,
              respuestasItem: { $exists: true, $ne: [] },
              $expr: { 
                $and: [
                  { $gt: [{ $size: "$respuestasItem" }, 0] },
                  { $lt: [{ $size: "$respuestasItem" }, totalPreguntas] }
                ]
              }
            });
          }
          
          abandonadas += await RespuestaModel.countDocuments({
            ...filtroEncuesta,
            respuestasItem: { $size: 0 }
          });
        }
        
        return {
          tipo: tiposFrontend[index],
          completadas,
          parciales,
          abandonadas,
          total: completadas + parciales + abandonadas
        };
      }));

      // Distribución de respuestas - basada en dataPorTipo
      const completadasTotal = dataPorTipo.reduce((sum, item) => sum + item.completadas, 0);
      const parcialesTotal = dataPorTipo.reduce((sum, item) => sum + item.parciales, 0);
      const abandonadasTotal = dataPorTipo.reduce((sum, item) => sum + item.abandonadas, 0);
      
      const distribucionRespuestas = {
        completadas: completadasTotal,
        parciales: parcialesTotal,
        abandonadas: abandonadasTotal
      };
      
      // Distribución de satisfacción basada en respuestas reales
      const distribucionSatisfaccion = await this.calcularDistribucionSatisfaccion(
        fechaLimite,
        empresa
      );

      // Preparar datos para exportación
      const exportData: MetricsExportData = {
        periodo: `Últimos ${diasNumero} días`,
        fechaGeneracion: new Date().toLocaleString('es-ES'),
        filtros: {
          empresa,
          area,
          dias: diasNumero
        },
        resumenGeneral: {
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
      };

      // Generar archivo según formato
      console.log('🔄 Generando archivo en formato:', formato);
      let fileName: string;
      let contentType: string;
      let fileData: Buffer | string;

      switch (formato.toLowerCase()) {
        case 'csv':
          console.log('📊 Generando CSV...');
          fileName = `metricas_${Date.now()}.csv`;
          contentType = 'text/csv';
          fileData = await ExportService.generateCSV(exportData);
          console.log('✅ CSV generado:', fileName, fileData.length, 'caracteres');
          break;

        case 'pdf':
          console.log('📄 Generando PDF...');
          fileName = `metricas_${Date.now()}.pdf`;
          contentType = 'application/pdf';
          fileData = await ExportService.generatePDF(exportData);
          console.log('✅ PDF generado:', fileName, fileData.length, 'bytes');
          break;

        case 'json':
        default:
          console.log('📝 Generando JSON...');
          fileName = `metricas_${Date.now()}.json`;
          contentType = 'application/json';
          fileData = await ExportService.generateJSON(exportData);
          console.log('✅ JSON generado:', fileName, fileData.length, 'caracteres');
          break;
      }

      console.log('📤 Enviando archivo:', fileName);
      console.log('📋 Content-Type:', contentType);
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Enviar archivo
      res.send(fileData);
      
      console.log('✅ Archivo enviado exitosamente');
      
    } catch (error) {
      console.error('Error al exportar métricas:', error);
      next(error);
    }
  }

  /**
   * Calcula la distribución de satisfacción basada en respuestas reales
   * Analiza preguntas de tipo "escala" para clasificar como buena/regular/mala
   */
  private async calcularDistribucionSatisfaccion(fechaLimite: Date, empresa?: string) {
    try {
      // Obtener todas las encuestas de tipo "satisfaccion"
      const filtro: any = { tipoEncuesta: 'satisfaccion' };
      if (empresa) {
        filtro.empresaRelacionada = empresa;
      }
      
      const encuestasSatisfaccion = await EncuestaModel.find(filtro, '_id preguntas');
      
      if (encuestasSatisfaccion.length === 0) {
        return { buena: 0, regular: 0, mala: 0 };
      }

      let satisfaccionBuena = 0;
      let satisfaccionRegular = 0;
      let satisfaccionMala = 0;
      let totalRespuestasConSatisfaccion = 0;

      // Para cada encuesta de satisfacción
      for (const encuesta of encuestasSatisfaccion) {
        // Obtener preguntas de escala
        const preguntasEscala = encuesta.preguntas?.filter((p: any) => p.tipoPregunta === 'escala') || [];
        
        if (preguntasEscala.length === 0) continue;

        // Obtener respuestas a esta encuesta
        const respuestas = await RespuestaModel.find({
          idEncuesta: encuesta._id,
          creadaEn: { $gte: fechaLimite },
          respuestasItem: { $exists: true, $ne: [] }
        });

        for (const respuesta of respuestas) {
          // Para cada pregunta de escala, obtener la puntuación
          for (const pregunta of preguntasEscala) {
            const itemRespuesta = respuesta.respuestasItem?.find(
              (item: any) => {
                const itemId = item.idPregunta?.toString?.() || item.idPregunta;
                const preguntaId = pregunta.idPregunta?.toString?.() || pregunta.idPregunta;
                return itemId === preguntaId;
              }
            );

            if (itemRespuesta) {
              const valorRespuesta = parseInt(String(itemRespuesta.respuesta)) || 0;
              
              // Clasificar según escala (1-5)
              if (valorRespuesta >= 4) {
                satisfaccionBuena++;
              } else if (valorRespuesta === 3) {
                satisfaccionRegular++;
              } else if (valorRespuesta <= 2) {
                satisfaccionMala++;
              }
              
              totalRespuestasConSatisfaccion++;
            }
          }
        }
      }

      // Si no hay respuestas con satisfacción registrada, retornar ceros
      if (totalRespuestasConSatisfaccion === 0) {
        return { buena: 0, regular: 0, mala: 0 };
      }

      return {
        buena: satisfaccionBuena,
        regular: satisfaccionRegular,
        mala: satisfaccionMala
      };
    } catch (error) {
      console.error('Error calculando distribución de satisfacción:', error);
      return { buena: 0, regular: 0, mala: 0 };
    }
  }

  /**
   * Calcula el tiempo promedio de completado en minutos
   */
  private async calcularTiempoPromedio(fechaLimite: Date, empresa?: string): Promise<number> {
    try {
      const pipeline: any[] = [
        {
          $match: {
            creadaEn: { $gte: fechaLimite },
            respuestasItem: { $exists: true, $ne: [] }
          }
        }
      ];

      // Si hay empresa, filtrar por encuestas relacionadas
      if (empresa) {
        const encuestasEmpresa = await EncuestaModel.find(
          { empresaRelacionada: empresa },
          '_id'
        );
        const idsEncuestas = encuestasEmpresa.map(e => e._id);
        pipeline.push({
          $match: { idEncuesta: { $in: idsEncuestas } }
        });
      }

      pipeline.push({
        $group: {
          _id: null,
          tiempoPromedio: {
            $avg: {
              $divide: [
                { $subtract: ['$actualizadaEn', '$creadaEn'] },
                60000 // Convertir ms a minutos
              ]
            }
          }
        }
      });

      const resultado = await RespuestaModel.aggregate(pipeline);
      
      if (resultado.length === 0) return 0;
      
      const tiempoPromedio = resultado[0].tiempoPromedio || 0;
      return Math.round(tiempoPromedio * 10) / 10; // Redondear a 1 decimal
    } catch (error) {
      console.error('Error calculando tiempo promedio:', error);
      return 0;
    }
  }

  /**
   * Calcula la tasa de respuesta real (usuarios únicos que respondieron / total de respuestas)
   */
  private async calcularTasaRespuesta(fechaLimite: Date, empresa?: string): Promise<number> {
    try {
      const filtro: any = { creadaEn: { $gte: fechaLimite } };

      if (empresa) {
        const encuestasEmpresa = await EncuestaModel.find(
          { empresaRelacionada: empresa },
          '_id'
        );
        const idsEncuestas = encuestasEmpresa.map(e => e._id);
        filtro.idEncuesta = { $in: idsEncuestas };
      }

      // Usuarios únicos que respondieron
      const usuariosUnicos = await RespuestaModel.distinct('idUsuario', filtro);
      const totalUsuariosUnicos = usuariosUnicos.length;

      // Total de respuestas (tanto completas como abandonadas)
      const totalRespuestas = await RespuestaModel.countDocuments(filtro);

      if (totalRespuestas === 0) return 0;

      // Tasa de respuesta: usuarios que respondieron / total de respuestas
      const tasaRespuesta = (totalUsuariosUnicos / totalRespuestas) * 100;
      return Math.round(tasaRespuesta * 10) / 10; // Redondear a 1 decimal
    } catch (error) {
      console.error('Error calculando tasa de respuesta:', error);
      return 0;
    }
  }

  /**
   * Calcula el promedio de satisfacción general en escala 1-5
   */
  private async calcularSatisfaccionGeneral(fechaLimite: Date, empresa?: string): Promise<number> {
    try {
      // Obtener encuestas de satisfacción
      const filtro: any = { tipoEncuesta: 'satisfaccion' };
      if (empresa) {
        filtro.empresaRelacionada = empresa;
      }

      const encuestasSatisfaccion = await EncuestaModel.find(filtro, '_id preguntas');

      if (encuestasSatisfaccion.length === 0) return 0;

      let sumaCalificaciones = 0;
      let totalCalificaciones = 0;

      for (const encuesta of encuestasSatisfaccion) {
        // Obtener preguntas de escala
        const preguntasEscala = encuesta.preguntas?.filter((p: any) => p.tipoPregunta === 'escala') || [];

        if (preguntasEscala.length === 0) continue;

        // Obtener respuestas completadas
        const respuestas = await RespuestaModel.find({
          idEncuesta: encuesta._id,
          creadaEn: { $gte: fechaLimite },
          respuestasItem: { $exists: true, $ne: [] }
        });

        for (const respuesta of respuestas) {
          for (const pregunta of preguntasEscala) {
            const itemRespuesta = respuesta.respuestasItem?.find(
              (item: any) => {
                const itemId = item.idPregunta?.toString?.() || item.idPregunta;
                const preguntaId = pregunta.idPregunta?.toString?.() || pregunta.idPregunta;
                return itemId === preguntaId;
              }
            );

            if (itemRespuesta) {
              const valor = parseInt(String(itemRespuesta.respuesta)) || 0;
              if (valor > 0) {
                sumaCalificaciones += valor;
                totalCalificaciones++;
              }
            }
          }
        }
      }

      if (totalCalificaciones === 0) return 0;

      const promedio = sumaCalificaciones / totalCalificaciones;
      return Math.round(promedio * 10) / 10; // Redondear a 1 decimal
    } catch (error) {
      console.error('Error calculando satisfacción general:', error);
      return 0;
    }
  }
}
