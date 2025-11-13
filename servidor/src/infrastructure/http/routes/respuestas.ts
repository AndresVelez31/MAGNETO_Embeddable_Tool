/**
 * Respuestas Routes
 * Rutas HTTP para el módulo de respuestas
 * Principio: Single Responsibility - Solo define rutas
 */

import { Router } from 'express';
import { RespuestaController } from '../controllers/RespuestaController';

const router = Router();
const controller = new RespuestaController();

// Bind controller methods to preserve 'this' context
const getAll = controller.getAll.bind(controller);
const create = controller.create.bind(controller);
const registerNoResponse = controller.registerNoResponse.bind(controller);
const getByUser = controller.getByUser.bind(controller);
const getBySurvey = controller.getBySurvey.bind(controller);
const getById = controller.getById.bind(controller);
const getStats = controller.getStats.bind(controller);

/**
 * @route   GET /api/respuestas/stats/general
 * @desc    Obtener estadísticas generales de respuestas
 * @access  Public
 */
router.get('/stats/general', getStats);

/**
 * @route   GET /api/respuestas/usuario/:userId
 * @desc    Obtener respuestas de un usuario
 * @access  Public
 */
router.get('/usuario/:userId', getByUser);

/**
 * @route   GET /api/respuestas/encuesta/:surveyId
 * @desc    Obtener respuestas de una encuesta
 * @access  Public
 */
router.get('/encuesta/:surveyId', getBySurvey);

/**
 * @route   POST /api/respuestas/no-respondio/:surveyId/:userId
 * @desc    Registrar que un usuario no respondió una encuesta
 * @access  Public
 */
router.post('/no-respondio/:surveyId/:userId', registerNoResponse);

/**
 * @route   GET /api/respuestas/:id
 * @desc    Obtener una respuesta por ID
 * @access  Public
 */
router.get('/:id', getById);

/**
 * @route   GET /api/respuestas
 * @desc    Obtener todas las respuestas
 * @access  Public
 */
router.get('/', getAll);

/**
 * @route   POST /api/respuestas
 * @desc    Crear una nueva respuesta
 * @access  Public
 */
router.post('/', create);

export default router;
