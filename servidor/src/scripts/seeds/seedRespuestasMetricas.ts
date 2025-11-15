import connectDB from '../../config/database';
import { Encuesta } from '../../infrastructure/database/models/Encuesta';
import { Respuesta } from '../../infrastructure/database/models/Respuesta';
import mongoose from 'mongoose';

/**
 * Script para generar respuestas variadas que muestren todas las métricas del dashboard
 * - Respuestas completas, parciales y abandonadas
 * - Satisfacción buena, regular y mala
 * - Tiempo promedio de completado (con timestamps reales)
 * - Tasa de respuesta realista
 */

const seedRespuestasMetricas = async () => {
  try {
    await connectDB();
    console.log('📊 === GENERADOR DE RESPUESTAS CON MÉTRICAS ===');

    // Limpiar respuestas antiguas
    await Respuesta.deleteMany({});
    console.log('🗑️ Respuestas antiguas eliminadas');

    // Obtener todas las encuestas
    const encuestas = await Encuesta.find();
    if (encuestas.length === 0) {
      console.log('❌ No hay encuestas. Por favor ejecuta seedEncuestas.ts primero');
      process.exit(1);
    }

    // Separar por tipo
    const encuestaSatisfaccion = encuestas.find(e => e.tipoEncuesta === 'satisfaccion');
    const encuestaPostulacion = encuestas.find(e => e.tipoEncuesta === 'postulacion');
    const encuestaAbandono = encuestas.find(e => e.tipoEncuesta === 'abandono');

    const usuarioIds = [
      'user_001', 'user_002', 'user_003', 'user_004', 'user_005',
      'maria.garcia@email.com', 'juan.perez@email.com', 'carlos.rodriguez@email.com',
      'anonymous', 'test_user_001'
    ];

    const respuestasParaInsertar: any[] = [];

    // ============================================
    // 1. RESPUESTAS DE SATISFACCIÓN (VARIADAS)
    // ============================================
    if (encuestaSatisfaccion) {
      console.log('\n📝 Creando respuestas de Satisfacción...');
      const preguntasEscala = encuestaSatisfaccion.preguntas.filter(p => p.tipoPregunta === 'escala');

      // Respuestas con satisfacción alta (4-5)
      for (let i = 0; i < 8; i++) {
        const tiempoCompletado = Math.floor(Math.random() * 15) + 5; // 5-20 minutos
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const actualizadaEn = new Date(creadaEn.getTime() + tiempoCompletado * 60 * 1000);

        const respuestasItem = preguntasEscala.map(pregunta => ({
          idPregunta: pregunta.idPregunta,
          respuesta: Math.random() > 0.3 ? '5' : '4' // 70% = 5, 30% = 4
        }));

        respuestasParaInsertar.push({
          idEncuesta: encuestaSatisfaccion._id,
          idUsuario: usuarioIds[i % usuarioIds.length],
          respuestasItem,
          creadaEn,
          actualizadaEn
        });
      }

      // Respuestas con satisfacción media (3)
      for (let i = 0; i < 4; i++) {
        const tiempoCompletado = Math.floor(Math.random() * 18) + 6; // 6-24 minutos
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const actualizadaEn = new Date(creadaEn.getTime() + tiempoCompletado * 60 * 1000);

        const respuestasItem = preguntasEscala.map(pregunta => ({
          idPregunta: pregunta.idPregunta,
          respuesta: '3'
        }));

        respuestasParaInsertar.push({
          idEncuesta: encuestaSatisfaccion._id,
          idUsuario: usuarioIds[(i + 8) % usuarioIds.length],
          respuestasItem,
          creadaEn,
          actualizadaEn
        });
      }

      // Respuestas con satisfacción baja (1-2)
      for (let i = 0; i < 5; i++) {
        const tiempoCompletado = Math.floor(Math.random() * 20) + 7; // 7-27 minutos
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const actualizadaEn = new Date(creadaEn.getTime() + tiempoCompletado * 60 * 1000);

        const respuestasItem = preguntasEscala.map(pregunta => ({
          idPregunta: pregunta.idPregunta,
          respuesta: Math.random() > 0.4 ? '2' : '1' // 60% = 2, 40% = 1
        }));

        respuestasParaInsertar.push({
          idEncuesta: encuestaSatisfaccion._id,
          idUsuario: usuarioIds[(i + 12) % usuarioIds.length],
          respuestasItem,
          creadaEn,
          actualizadaEn
        });
      }

      // Respuestas abandonadas
      for (let i = 0; i < 3; i++) {
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

        respuestasParaInsertar.push({
          idEncuesta: encuestaSatisfaccion._id,
          idUsuario: usuarioIds[(i + 17) % usuarioIds.length],
          respuestasItem: [],
          creadaEn,
          actualizadaEn: creadaEn
        });
      }

      console.log(`✅ Preparadas 20 respuestas de satisfacción`);
    }

    // ============================================
    // 2. RESPUESTAS DE POSTULACIÓN (VARIADAS)
    // ============================================
    if (encuestaPostulacion) {
      console.log('\n📋 Creando respuestas de Postulación...');
      const totalPreguntas = encuestaPostulacion.preguntas.length;

      // Respuestas completas (todas las preguntas)
      for (let i = 0; i < 12; i++) {
        const tiempoCompletado = Math.floor(Math.random() * 20) + 10; // 10-30 minutos
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const actualizadaEn = new Date(creadaEn.getTime() + tiempoCompletado * 60 * 1000);

        const respuestasItem = encuestaPostulacion.preguntas.map(pregunta => {
          let respuesta: any;
          switch (pregunta.tipoPregunta) {
            case 'opcion_unica':
              respuesta = pregunta.opcionesRespuesta[Math.floor(Math.random() * pregunta.opcionesRespuesta.length)].valor;
              break;
            case 'opcion_multiple':
              respuesta = [pregunta.opcionesRespuesta[Math.floor(Math.random() * pregunta.opcionesRespuesta.length)].valor];
              break;
            case 'abierta':
              respuesta = `Comentario del usuario ${i}`;
              break;
            default:
              respuesta = 'respuesta genérica';
          }

          return {
            idPregunta: pregunta.idPregunta,
            respuesta
          };
        });

        respuestasParaInsertar.push({
          idEncuesta: encuestaPostulacion._id,
          idUsuario: usuarioIds[i % usuarioIds.length],
          respuestasItem,
          creadaEn,
          actualizadaEn
        });
      }

      // Respuestas parciales (solo algunas preguntas)
      for (let i = 0; i < 6; i++) {
        const tiempoCompletado = Math.floor(Math.random() * 15) + 8; // 8-23 minutos
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const actualizadaEn = new Date(creadaEn.getTime() + tiempoCompletado * 60 * 1000);

        const preguntasRespondidas = Math.floor(totalPreguntas * 0.6); // 60% de preguntas
        const respuestasItem = encuestaPostulacion.preguntas.slice(0, preguntasRespondidas).map(pregunta => {
          let respuesta: any;
          if (pregunta.tipoPregunta === 'opcion_multiple') {
            respuesta = [pregunta.opcionesRespuesta[0].valor];
          } else if (pregunta.tipoPregunta === 'abierta') {
            respuesta = `Respuesta parcial ${i}`;
          } else {
            respuesta = pregunta.opcionesRespuesta[0].valor;
          }

          return {
            idPregunta: pregunta.idPregunta,
            respuesta
          };
        });

        respuestasParaInsertar.push({
          idEncuesta: encuestaPostulacion._id,
          idUsuario: usuarioIds[(i + 12) % usuarioIds.length],
          respuestasItem,
          creadaEn,
          actualizadaEn
        });
      }

      // Respuestas abandonadas
      for (let i = 0; i < 5; i++) {
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

        respuestasParaInsertar.push({
          idEncuesta: encuestaPostulacion._id,
          idUsuario: usuarioIds[(i + 18) % usuarioIds.length],
          respuestasItem: [],
          creadaEn,
          actualizadaEn: creadaEn
        });
      }

      console.log(`✅ Preparadas 23 respuestas de postulación`);
    }

    // ============================================
    // 3. RESPUESTAS DE ABANDONO/DESERCIÓN
    // ============================================
    if (encuestaAbandono) {
      console.log('\n🚪 Creando respuestas de Abandono/Deserción...');

      // Respuestas completas
      for (let i = 0; i < 10; i++) {
        const tiempoCompletado = Math.floor(Math.random() * 18) + 6; // 6-24 minutos
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const actualizadaEn = new Date(creadaEn.getTime() + tiempoCompletado * 60 * 1000);

        const respuestasItem = encuestaAbandono.preguntas.map(pregunta => {
          let respuesta: any;
          switch (pregunta.tipoPregunta) {
            case 'opcion_unica':
              respuesta = pregunta.opcionesRespuesta[Math.floor(Math.random() * pregunta.opcionesRespuesta.length)].valor;
              break;
            case 'escala':
              respuesta = String(Math.floor(Math.random() * 5) + 1); // 1-5
              break;
            case 'abierta':
              respuesta = `Feedback del abandono ${i}`;
              break;
            default:
              respuesta = 'respuesta';
          }

          return {
            idPregunta: pregunta.idPregunta,
            respuesta
          };
        });

        respuestasParaInsertar.push({
          idEncuesta: encuestaAbandono._id,
          idUsuario: usuarioIds[i % usuarioIds.length],
          respuestasItem,
          creadaEn,
          actualizadaEn
        });
      }

      // Respuestas parciales
      for (let i = 0; i < 4; i++) {
        const tiempoCompletado = Math.floor(Math.random() * 14) + 5; // 5-19 minutos
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const actualizadaEn = new Date(creadaEn.getTime() + tiempoCompletado * 60 * 1000);

        const preguntasRespondidas = Math.floor(encuestaAbandono.preguntas.length * 0.5); // 50%
        const respuestasItem = encuestaAbandono.preguntas.slice(0, preguntasRespondidas).map(pregunta => ({
          idPregunta: pregunta.idPregunta,
          respuesta: pregunta.opcionesRespuesta[0]?.valor || 'respuesta'
        }));

        respuestasParaInsertar.push({
          idEncuesta: encuestaAbandono._id,
          idUsuario: usuarioIds[(i + 10) % usuarioIds.length],
          respuestasItem,
          creadaEn,
          actualizadaEn
        });
      }

      // Respuestas abandonadas
      for (let i = 0; i < 6; i++) {
        const creadaEn = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

        respuestasParaInsertar.push({
          idEncuesta: encuestaAbandono._id,
          idUsuario: usuarioIds[(i + 14) % usuarioIds.length],
          respuestasItem: [],
          creadaEn,
          actualizadaEn: creadaEn
        });
      }

      console.log(`✅ Preparadas 20 respuestas de abandono`);
    }

    // Insertar todas las respuestas de una vez usando insertMany
    // insertMany ignora los timestamps automáticos de Mongoose si se pasan explícitamente
    const collection = mongoose.connection.collection('respuesta');
    await collection.insertMany(respuestasParaInsertar);

    console.log('\n' + '='.repeat(50));
    console.log(`📊 TOTAL DE RESPUESTAS GENERADAS: ${respuestasParaInsertar.length}`);
    console.log('='.repeat(50));
    console.log('\n📈 DISTRIBUCIÓN ESPERADA:');
    console.log(`  • Satisfacción: 20 respuestas`);
    console.log(`    - Alta (4-5): 8 respuestas (Buena)`);
    console.log(`    - Media (3): 4 respuestas (Regular)`);
    console.log(`    - Baja (1-2): 5 respuestas (Mala)`);
    console.log(`    - Abandonadas: 3 respuestas`);
    console.log(`  • Postulación: 23 respuestas`);
    console.log(`    - Completas: 12 respuestas`);
    console.log(`    - Parciales: 6 respuestas`);
    console.log(`    - Abandonadas: 5 respuestas`);
    console.log(`  • Abandono: 20 respuestas`);
    console.log(`    - Completas: 10 respuestas`);
    console.log(`    - Parciales: 4 respuestas`);
    console.log(`    - Abandonadas: 6 respuestas`);
    console.log('\n✅ Script ejecutado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seedRespuestasMetricas:', error);
    process.exit(1);
  }
};

seedRespuestasMetricas();
