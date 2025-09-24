import { Router, Request, Response } from 'express';
import { Encuesta } from '../models/Encuesta';
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
    const { tipoEncuesta, nombreEncuesta, empresaRelacionada, preguntas = [] } = req.body;
    
    if (!tipoEncuesta || !nombreEncuesta) {
      return res.status(400).json({ 
        mensaje: 'Los campos tipoEncuesta y nombreEncuesta son obligatorios' 
      });
    }
    
    // Validar preguntas si existen
    const preguntasValidadas = preguntas.map((pregunta: any) => ({
      ...pregunta,
      idPregunta: pregunta.idPregunta || new Types.ObjectId()
    }));
    
    const nuevaEncuesta = new Encuesta({
      tipoEncuesta,
      nombreEncuesta,
      empresaRelacionada,
      preguntas: preguntasValidadas,
      estado: 'borrador'
    });
    
    const encuestaGuardada = await nuevaEncuesta.save();
    res.status(201).json(encuestaGuardada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la encuesta', error });
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

export default router;