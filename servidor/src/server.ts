/**
 * Server
 * Punto de entrada principal del servidor
 * Principio: Single Responsibility - Solo bootstrap de la aplicación
 */

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/database';
import encuestasRoutes from './infrastructure/http/routes/encuestas';
import respuestasRoutes from './infrastructure/http/routes/respuestas';
import { errorHandler, notFoundHandler } from './infrastructure/http/middlewares/error.middleware';

const app = express();

// ============================================
// Middlewares Globales
// ============================================

// CORS - Permitir peticiones desde el cliente
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
    });
    next();
  });
}

// ============================================
// Routes
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a MAGNETO Embeddable Tool API',
    version: '2.0.0',
    status: 'OK',
  });
});

// API Routes
app.use('/api/encuestas', encuestasRoutes);
app.use('/api/respuestas', respuestasRoutes);

// ============================================
// Error Handling
// ============================================

// 404 - Not Found
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ============================================
// Database Connection & Server Start
// ============================================

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Conectar a MongoDB
    await connectDB();
    console.log('✅ Conexión a MongoDB establecida');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Cliente: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();

export default app;
