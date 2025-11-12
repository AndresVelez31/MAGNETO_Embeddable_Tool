import { Router, Request, Response } from 'express';
import { Encuesta } from '../models/Encuesta';
import { Respuesta } from '../models/Respuesta';
import { Types } from 'mongoose';

const router = Router();

// Obtener todas las encuestas
router.get('/', async (req: Request, res: Response) => {
  try {
    const encuestas = await Encuesta.find().sort({ ultimaModificacion: -1 });
    res.json(encuestas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las encuestas', error });
  }
});

// Obtener encuestas por tipo
router.get('/tipo/:tipoEncuesta', async (req: Request, res: Response) => {
  try {
    const { tipoEncuesta } = req.params;
    
    // Buscar encuestas activas del tipo solicitado
    const encuestas = await Encuesta.find({ 
      tipoEncuesta: tipoEncuesta, 
      estado: 'activa' 
    }).sort({ ultimaModificacion: -1 });
    
    if (encuestas.length === 0) {
      return res.status(404).json({ mensaje: `No se encontraron encuestas activas del tipo: ${tipoEncuesta}` });
    }
    
    // Retornar la primera encuesta activa del tipo
    res.json(encuestas[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la encuesta por tipo', error });
  }
});

// Obtener una encuesta por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID de encuesta inválido' });
    }
    
    const encuesta = await Encuesta.findById(id);
    
    if (!encuesta) {
      return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
    }
    
    res.json(encuesta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la encuesta', error });
  }
});

// Crear una nueva encuesta
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('📥 Recibiendo petición POST /encuestas');
    console.log('📄 Body recibido:', JSON.stringify(req.body, null, 2));
    
    const { tipoEncuesta, nombreEncuesta, empresaRelacionada, preguntas = [] } = req.body;
    
    console.log('✅ Campos extraídos:', { tipoEncuesta, nombreEncuesta, empresaRelacionada, cantidadPreguntas: preguntas.length });
    
    if (!tipoEncuesta || !nombreEncuesta) {
      console.log('❌ Validación fallida: campos obligatorios faltantes');
      return res.status(400).json({ 
        mensaje: 'Los campos tipoEncuesta y nombreEncuesta son obligatorios' 
      });
    }
    
    // Validar preguntas si existen
    console.log('🔍 Validando preguntas...');
    const preguntasValidadas = preguntas.map((pregunta: any) => ({
      ...pregunta,
      idPregunta: pregunta.idPregunta || new Types.ObjectId().toString()
    }));
    
    console.log('📝 Creando nueva encuesta en base de datos...');
    const nuevaEncuesta = new Encuesta({
      tipoEncuesta,
      nombreEncuesta,
      empresaRelacionada,
      preguntas: preguntasValidadas,
      estado: 'borrador'
    });
    
    console.log('💾 Guardando encuesta...');
    const encuestaGuardada = await nuevaEncuesta.save();
    console.log('✅ Encuesta guardada exitosamente:', encuestaGuardada._id);
    res.status(201).json(encuestaGuardada);
  } catch (error) {
    console.error('❌ Error detallado al crear encuesta:', error);
    res.status(500).json({ mensaje: 'Error al crear la encuesta', error: error instanceof Error ? error.message : error });
  }
});

// Actualizar una encuesta
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID de encuesta inválido' });
    }
    
    const updateData = {
      ...req.body,
      ultimaModificacion: new Date()
    };
    
    const encuestaActualizada = await Encuesta.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!encuestaActualizada) {
      return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
    }
    
    res.json(encuestaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la encuesta', error });
  }
});

// Cambiar estado de una encuesta
router.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID de encuesta inválido' });
    }
    
    const estadosValidos = ['borrador', 'activa', 'inactiva', 'archivada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        mensaje: 'Estado inválido. Debe ser: borrador, activa, inactiva o archivada' 
      });
    }
    
    const encuesta = await Encuesta.findByIdAndUpdate(
      id,
      { estado, ultimaModificacion: new Date() },
      { new: true }
    );
    
    if (!encuesta) {
      return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
    }
    
    res.json(encuesta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar el estado de la encuesta', error });
  }
});

// Eliminar una encuesta
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID de encuesta inválido' });
    }
    
    const encuesta = await Encuesta.findByIdAndDelete(id);
    
    if (!encuesta) {
      return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
    }
    
    res.json({ mensaje: 'Encuesta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la encuesta', error });
  }
});

// Guardar respuestas de una encuesta
router.post('/:id/respuestas', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { respuestasItem } = req.body;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID de encuesta inválido' });
    }
    
    if (!respuestasItem || !Array.isArray(respuestasItem)) {
      return res.status(400).json({ 
        mensaje: 'Se requiere respuestasItem como array' 
      });
    }
    
    // Verificar que la encuesta existe
    const encuesta = await Encuesta.findById(id);
    if (!encuesta) {
      return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
    }
    
    // Crear nueva respuesta (usuario anónimo por defecto)
    const nuevaRespuesta = new Respuesta({
      idEncuesta: id,
      idUsuario: '000000000000000000000000', // Usuario anónimo por defecto
      respuestasItem: respuestasItem
    });
    
    const respuestaGuardada = await nuevaRespuesta.save();
    res.status(201).json(respuestaGuardada);
    
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar la respuesta', error });
  }
});

// Registrar que el usuario no respondió la encuesta
router.post('/:id/no-respondio', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID de encuesta inválido' });
    }
    
    // Verificar que la encuesta existe
    const encuesta = await Encuesta.findById(id);
    if (!encuesta) {
      return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
    }
    
    // Registrar como "no respondió" con respuestas vacías (usuario anónimo)
    const respuestaNoRespondio = new Respuesta({
      idEncuesta: id,
      idUsuario: '000000000000000000000000', // Usuario anónimo por defecto
      respuestasItem: [] // Array vacío indica "no respondió"
    });
    
    const respuestaGuardada = await respuestaNoRespondio.save();
    res.status(201).json({ mensaje: 'Registrado como no respondió', respuesta: respuestaGuardada });
    
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar no respuesta', error });
  }
});

// Obtener métricas y estadísticas de encuestas
router.get('/analytics/metricas', async (req: Request, res: Response) => {
  try {
    const { dias = '30' } = req.query;
    const diasNumero = parseInt(dias as string);
    
    // Calcular fecha límite
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasNumero);
    
    // Total de respuestas en el período (usar creadaEn en lugar de fechaRespuesta)
    const totalRespuestas = await Respuesta.countDocuments({
      creadaEn: { $gte: fechaLimite }
    });
    
    // Respuestas completadas (con al menos 1 respuesta)
    const respuestasCompletas = await Respuesta.countDocuments({
      creadaEn: { $gte: fechaLimite },
      respuestasItem: { $exists: true, $ne: [] }
    });
    
    // Respuestas abandonadas (sin respuestas)
    const respuestasAbandonadas = await Respuesta.countDocuments({
      creadaEn: { $gte: fechaLimite },
      respuestasItem: { $size: 0 }
    });
    
    // Tasa de completado
    const tasaCompletado = totalRespuestas > 0 
      ? ((respuestasCompletas / totalRespuestas) * 100).toFixed(1) 
      : '0.0';
    
    // Tasa de abandono
    const tasaAbandono = totalRespuestas > 0 
      ? ((respuestasAbandonadas / totalRespuestas) * 100).toFixed(1) 
      : '0.0';
    
    // Encuestas activas
    const encuestasActivas = await Encuesta.countDocuments({ estado: 'activa' });
    
    // Respuestas por tipo de encuesta
    const encuestas = await Encuesta.find({}, 'tipoEncuesta preguntas');
    const respuestasPorTipo = await Promise.all(
      encuestas.map(async (encuesta) => {
        const completadas = await Respuesta.countDocuments({
          idEncuesta: encuesta._id,
          creadaEn: { $gte: fechaLimite },
          respuestasItem: { $exists: true, $ne: [] }
        });
        
        const totalPreguntas = encuesta.preguntas?.length || 0;
        const parciales = totalPreguntas > 0 ? await Respuesta.countDocuments({
          idEncuesta: encuesta._id,
          creadaEn: { $gte: fechaLimite },
          $expr: { 
            $and: [
              { $gt: [{ $size: "$respuestasItem" }, 0] },
              { $lt: [{ $size: "$respuestasItem" }, totalPreguntas] }
            ]
          }
        }) : 0;
        
        const abandonadas = await Respuesta.countDocuments({
          idEncuesta: encuesta._id,
          creadaEn: { $gte: fechaLimite },
          respuestasItem: { $size: 0 }
        });
        
        return {
          tipo: encuesta.tipoEncuesta,
          completadas,
          parciales,
          abandonadas
        };
      })
    );
    
    // Agrupar por tipo
    const tiposUnicos = ['application', 'abandonment', 'custom'];
    const dataPorTipo = tiposUnicos.map(tipo => {
      const respuestasTipo = respuestasPorTipo.filter(r => r.tipo === tipo);
      return {
        tipo,
        completadas: respuestasTipo.reduce((sum, r) => sum + r.completadas, 0),
        parciales: respuestasTipo.reduce((sum, r) => sum + r.parciales, 0),
        abandonadas: respuestasTipo.reduce((sum, r) => sum + r.abandonadas, 0)
      };
    });
    
    // Distribución de estados de respuestas
    const distribucionRespuestas = {
      completadas: respuestasCompletas,
      parciales: totalRespuestas - respuestasCompletas - respuestasAbandonadas,
      abandonadas: respuestasAbandonadas
    };
    
    // Clasificación de satisfacción (basado en ratings promedio)
    // Esto es un ejemplo simple - ajustar según lógica de negocio
    const satisfaccionBuena = Math.floor(respuestasCompletas * 0.6); // 60%
    const satisfaccionRegular = Math.floor(respuestasCompletas * 0.3); // 30%
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
        tasaCompletado: parseFloat(tasaCompletado),
        tasaAbandono: parseFloat(tasaAbandono),
        encuestasActivas
      },
      respuestasPorTipo: dataPorTipo,
      distribucionRespuestas,
      distribucionSatisfaccion
    });
    
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ mensaje: 'Error al obtener métricas', error });
  }
});

export default router;