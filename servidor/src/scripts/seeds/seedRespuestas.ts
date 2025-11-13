import connectDB from '../../config/database';
import { Respuesta } from '../../infrastructure/database/models/Respuesta';
import { Encuesta } from '../../infrastructure/database/models/Encuesta';
import { Types } from 'mongoose';

/**
 * Genera respuestas realistas según el tipo de pregunta
 */
const generarRespuesta = (pregunta: any) => {
  const tipo = pregunta.tipoPregunta;
  const opciones = pregunta.opcionesRespuesta || [];
  
  switch (tipo) {
    case 'texto':
    case 'abierta': {
      const respuestasTexto = [
        'Excelente proceso, muy profesional y organizado.',
        'Me gustó la atención recibida durante todo el proceso.',
        'Buena experiencia en general, aunque podría mejorar la comunicación.',
        'El proceso fue claro y bien estructurado.',
        'Muy satisfecho con la rapidez y eficiencia.',
        'Considero que hay áreas de mejora en los tiempos de respuesta.',
        'La plataforma es intuitiva y fácil de usar.',
        'Recomendaría este servicio a otros candidatos.',
      ];
      return respuestasTexto[Math.floor(Math.random() * respuestasTexto.length)];
    }
    
    case 'lista':
    case 'opcion_unica': {
      if (opciones.length > 0) {
        const opcion = opciones[Math.floor(Math.random() * opciones.length)];
        return opcion.texto || opcion.valor || opcion;
      }
      return 'Opción 1';
    }
    
    case 'opcionMultiple':
    case 'opcion_multiple': {
      if (opciones.length > 0) {
        const numSeleccionadas = Math.floor(Math.random() * Math.min(3, opciones.length)) + 1;
        const seleccionadas = [];
        const opcionesDisponibles = [...opciones];
        
        for (let i = 0; i < numSeleccionadas && opcionesDisponibles.length > 0; i++) {
          const index = Math.floor(Math.random() * opcionesDisponibles.length);
          const opcion = opcionesDisponibles.splice(index, 1)[0];
          seleccionadas.push(opcion.texto || opcion.valor || opcion);
        }
        return seleccionadas;
      }
      return ['Opción 1', 'Opción 2'];
    }
    
    case 'calificacion':
    case 'escala':
    case 'rating': {
      if (opciones.length > 0) {
        const opcion = opciones[Math.floor(Math.random() * opciones.length)];
        return opcion.valor || opcion;
      }
      return Math.floor(Math.random() * 5) + 1; // 1-5
    }
    
    case 'nps': {
      if (opciones.length > 0) {
        const opcion = opciones[Math.floor(Math.random() * opciones.length)];
        return opcion.valor || opcion;
      }
      return Math.floor(Math.random() * 11); // 0-10
    }
    
    default:
      return 'Respuesta de prueba';
  }
};

const seedRespuestas = async (): Promise<void> => {
  try {
    console.log('🎯 Iniciando seed de respuestas...\n');

    await connectDB();

    // Obtener encuestas activas
    console.log('📋 Buscando encuestas activas...');
    const encuestas = await Encuesta.find({ estado: 'activa' });
    
    if (encuestas.length === 0) {
      console.log('⚠️  No hay encuestas activas.');
      console.log('💡 Ejecuta: npm run seed:encuestas\n');
      process.exit(0);
    }

    console.log(`✅ Encontradas ${encuestas.length} encuestas activas\n`);

    // Limpiar respuestas existentes
    console.log('�️  Limpiando respuestas anteriores...');
    const deleted = await Respuesta.deleteMany({});
    console.log(`   Eliminadas: ${deleted.deletedCount} respuestas\n`);

    console.log('✏️  Generando nuevas respuestas...\n');

    // IDs de usuarios simulados
    const usuariosSimulados = [
      'user_001',
      'user_002', 
      'user_003',
      'user_004',
      'user_005',
      'juan.perez@email.com',
      'maria.garcia@email.com',
      'carlos.rodriguez@email.com',
    ];

    let totalCreadas = 0;

    // Para cada encuesta
    for (const encuesta of encuestas) {
      console.log(`📝 Encuesta: "${encuesta.nombreEncuesta}"`);
      console.log(`   Preguntas: ${encuesta.preguntas.length}`);
      
      // Crear 5-10 respuestas por encuesta
      const numRespuestas = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < numRespuestas; i++) {
        // Decidir si es anónima (20% de probabilidad)
        const esAnonima = Math.random() < 0.2;
        const idUsuario = esAnonima 
          ? 'anonymous'
          : usuariosSimulados[Math.floor(Math.random() * usuariosSimulados.length)];

        // Generar respuestas para todas las preguntas
        const respuestasItem = encuesta.preguntas.map((pregunta: any) => ({
          idPregunta: pregunta.idPregunta,
          respuesta: generarRespuesta(pregunta),
        }));

        // Crear la respuesta
        const nuevaRespuesta = new Respuesta({
          idEncuesta: encuesta._id,
          idUsuario: idUsuario,
          respuestasItem: respuestasItem,
        });

        await nuevaRespuesta.save();
        totalCreadas++;
        
        const tipo = esAnonima ? '👤 Anónima' : `👤 ${idUsuario}`;
        console.log(`   ✅ ${tipo} (${respuestasItem.length} respuestas)`);
      }
      
      // Agregar algunas respuestas "no respondió" (array vacío)
      const numNoRespondieron = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numNoRespondieron; i++) {
        const idUsuario = usuariosSimulados[Math.floor(Math.random() * usuariosSimulados.length)];
        
        const respuestaVacia = new Respuesta({
          idEncuesta: encuesta._id,
          idUsuario: idUsuario,
          respuestasItem: [], // No respondió
        });

        await respuestaVacia.save();
        totalCreadas++;
        console.log(`   ⏭️  No respondió: ${idUsuario}`);
      }
      
      console.log('');
    }

    // Estadísticas finales
    console.log('━'.repeat(50));
    console.log('📊 ESTADÍSTICAS FINALES\n');
    
    const total = await Respuesta.countDocuments();
    const completadas = await Respuesta.countDocuments({ 
      respuestasItem: { $exists: true, $ne: [] } 
    });
    const noRespondieron = await Respuesta.countDocuments({ 
      respuestasItem: { $exists: true, $eq: [] } 
    });
    const anonimas = await Respuesta.countDocuments({ idUsuario: 'anonymous' });
    
    console.log(`Total de respuestas:     ${total}`);
    console.log(`Completadas:             ${completadas}`);
    console.log(`No respondieron:         ${noRespondieron}`);
    console.log(`Anónimas:                ${anonimas}`);
    console.log(`Identificadas:           ${total - anonimas}\n`);

    // Desglose por encuesta
    console.log('📈 Por encuesta:\n');
    for (const encuesta of encuestas) {
      const count = await Respuesta.countDocuments({ idEncuesta: encuesta._id });
      const tipo = encuesta.tipoEncuesta || 'N/A';
      console.log(`   ${encuesta.nombreEncuesta}`);
      console.log(`   Tipo: ${tipo} | Respuestas: ${count}\n`);
    }

    console.log('━'.repeat(50));
    console.log('✅ Seed de respuestas completado exitosamente!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedRespuestas();
}

export default seedRespuestas;