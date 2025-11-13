/**
 * Encuestas Routes
 * Rutas HTTP para el módulo de encuestas
 * Principio: Single Responsibility - Solo define rutas
 */

import { Router } from 'express';
import { EncuestaController } from '../controllers/EncuestaController';

const router = Router();
const controller = new EncuestaController();

// Bind controller methods to preserve 'this' context
const getAll = controller.getAll.bind(controller);
const getById = controller.getById.bind(controller);
const getByType = controller.getByType.bind(controller);
const getActiveByType = controller.getActiveByType.bind(controller);
const create = controller.create.bind(controller);
const update = controller.update.bind(controller);
const updateStatus = controller.updateStatus.bind(controller);
const deleteEncuesta = controller.delete.bind(controller);
const getStatsByStatus = controller.getStatsByStatus.bind(controller);
const getMetrics = controller.getMetrics.bind(controller);
const getStoredMetrics = controller.getStoredMetrics.bind(controller);
const getFakeMetrics = controller.getFakeMetrics ? controller.getFakeMetrics.bind(controller) : (() => { throw new Error('Not implemented'); });
const getGeneratedMetrics = controller.getGeneratedMetrics ? controller.getGeneratedMetrics.bind(controller) : (() => { throw new Error('Not implemented'); });

/**
 * @route   GET /api/encuestas
 * @desc    Obtener todas las encuestas
 * @access  Public
 */
router.get('/', getAll);

/**
 * @route   GET /api/encuestas/stats/estado
 * @desc    Obtener estadísticas por estado
 * @access  Public
 */
router.get('/stats/estado', getStatsByStatus);

/**
 * @route   GET /api/encuestas/analytics/metricas
 * @desc    Obtener métricas y análisis de encuestas
 * @access  Public
 */
router.get('/analytics/metricas', getMetrics);
router.get('/analytics/metricas/almacenadas', getStoredMetrics);
router.get('/analytics/metricas/fake', getFakeMetrics);
router.get('/analytics/metricas/generadas', getGeneratedMetrics);

/**
 * @route   GET /api/encuestas/tipo/:tipo/activa
 * @desc    Obtener encuesta activa por tipo
 * @access  Public
 */
router.get('/tipo/:tipo/activa', getActiveByType);

/**
 * @route   GET /api/encuestas/tipo/:tipo
 * @desc    Obtener encuestas por tipo
 * @access  Public
 */
router.get('/tipo/:tipo', getByType);

/**
 * @route   GET /api/encuestas/:id
 * @desc    Obtener encuesta por ID
 * @access  Public
 */
router.get('/:id', getById);

/**
 * @route   POST /api/encuestas
 * @desc    Crear nueva encuesta
 * @access  Public
 */
router.post('/', create);

/**
 * @route   PUT /api/encuestas/:id
 * @desc    Actualizar encuesta
 * @access  Public
 */
router.put('/:id', update);

/**
 * @route   PATCH /api/encuestas/:id/estado
 * @desc    Actualizar estado de encuesta
 * @access  Public
 */
router.patch('/:id/estado', updateStatus);

/**
 * @route   DELETE /api/encuestas/:id
 * @desc    Eliminar encuesta
 * @access  Public
 */
router.delete('/:id', deleteEncuesta);

export default router;
