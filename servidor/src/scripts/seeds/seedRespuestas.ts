import connectDB from '../../config/database';
import { Respuesta } from '../../infrastructure/database/models/Respuesta';
import { Encuesta } from '../../infrastructure/database/models/Encuesta';
import { Usuario } from '../../infrastructure/database/models/Usuario';
import { Types } from 'mongoose';

const generarRespuestasRealisticas = (pregunta: any) => {
  const tipo = pregunta.tipoPregunta;
  
  switch (tipo) {
    case 'opcion_unica': {
      // Seleccionar una opción aleatoria
      const opciones = pregunta.opcionesRespuesta || [];
      if (opciones.length > 0) {
        const opcionSeleccionada = opciones[Math.floor(Math.random() * opciones.length)];
        return opcionSeleccionada.valor;
      }
      return null;
    }
      
    case 'opcion_multiple': {
      // Seleccionar entre 1-3 opciones aleatorias
      const opcionesMultiples = pregunta.opcionesRespuesta || [];
      if (opcionesMultiples.length === 0) return [];
      const numSelecciones = Math.floor(Math.random() * Math.min(3, opcionesMultiples.length)) + 1;
      const seleccionadas = [];
      const opcionesTemp = [...opcionesMultiples];
      for (let i = 0; i < numSelecciones; i++) {
        const index = Math.floor(Math.random() * opcionesTemp.length);
        seleccionadas.push(opcionesTemp.splice(index, 1)[0].valor);
      }
      return seleccionadas;
    }
      
    case 'abierta': {
      // Generar texto apropiado según el contexto
      if (pregunta.contenido.toLowerCase().includes('comentario') || 
          pregunta.contenido.toLowerCase().includes('sugerencia') ||
          pregunta.contenido.toLowerCase().includes('mejora')) {
        const respuestasLargas = [
          'La experiencia fue muy positiva en general. El personal fue amable y profesional, y el servicio cumplió con mis expectativas. Definitivamente recomendaría este servicio a otros.',
          'Hubo algunos aspectos que podrían mejorar, especialmente en términos de tiempo de respuesta, pero en general la calidad del servicio fue buena.',
          'Excelente atención al cliente. Me sentí valorado como usuario y todas mis consultas fueron respondidas de manera clara y oportuna.',
          'El servicio cumplió con lo prometido, aunque creo que hay oportunidades de mejora en la comunicación y seguimiento.',
          'Muy satisfecho con el resultado final. El proceso fue eficiente y el equipo demostró gran profesionalismo en todo momento.',
          'La experiencia superó mis expectativas. La atención fue personalizada y se notó el compromiso por brindar un servicio de calidad.',
          'Aunque el resultado fue satisfactorio, el proceso tomó más tiempo del esperado. Sugiero mejorar la planificación de tiempos.',
          'Desarrollé una aplicación web completa usando React y Node.js para gestionar inventarios de una pequeña empresa. Implementé autenticación, base de datos MongoDB y panel administrativo.'
        ];
        return respuestasLargas[Math.floor(Math.random() * respuestasLargas.length)];
      } else {
        const respuestasCortas = [
          'Excelente servicio',
          'Muy satisfecho',
          'Buena experiencia',
          'Podría mejorar',
          'Regular',
          'Satisfactorio',
          'Recomendable',
          'Eficiente',
          'Profesional',
          'Amigable'
        ];
        return respuestasCortas[Math.floor(Math.random() * respuestasCortas.length)];
      }
    }
      
    case 'escala': {
      // Generar valor de escala (típicamente 1-5)
      const opcionesEscala = pregunta.opcionesRespuesta || [];
      if (opcionesEscala.length > 0) {
        const opcionSeleccionada = opcionesEscala[Math.floor(Math.random() * opcionesEscala.length)];
        return opcionSeleccionada.valor;
      }
      return Math.floor(Math.random() * 5) + 1;
    }
      
    case 'nps': {
      // Generar valor NPS (0-10)
      const opcionesNps = pregunta.opcionesRespuesta || [];
      if (opcionesNps.length > 0) {
        const opcionSeleccionada = opcionesNps[Math.floor(Math.random() * opcionesNps.length)];
        return opcionSeleccionada.valor;
      }
      return Math.floor(Math.random() * 11); // 0-10
    }
      
    default:
      return 'Respuesta por defecto';
  }
};

const seedRespuestas = async (): Promise<void> => {
  try {
    console.log('🎯 Iniciando seed de respuestas...');

    // Conectar a la base de datos
    await connectDB();

    // Obtener todas las encuestas activas
    console.log('📋 Obteniendo encuestas disponibles...');
    const encuestas = await Encuesta.find({ estado: 'activa' });
    
    if (encuestas.length === 0) {
      console.log('⚠️ No se encontraron encuestas activas. Ejecuta primero el seed de encuestas.');
      return;
    }

    // Obtener todos los usuarios
    console.log('👥 Obteniendo usuarios disponibles...');
    const usuarios = await Usuario.find({});
    
    if (usuarios.length === 0) {
      console.log('⚠️ No se encontraron usuarios. Ejecuta primero el seed de usuarios.');
      return;
    }

    // Limpiar respuestas existentes (opcional)
    console.log('🗑️ Limpiando respuestas existentes...');
    await Respuesta.deleteMany({});

    console.log('✏️ Generando respuestas de prueba...');
    
    let totalRespuestas = 0;

    // Para cada encuesta, generar respuestas de varios usuarios
    for (const encuesta of encuestas) {
      console.log(`\n📝 Generando respuestas para: "${encuesta.nombreEncuesta}"`);
      
      // Cada encuesta tendrá respuestas de 3-7 usuarios aleatorios
      const numUsuariosQueResponden = Math.floor(Math.random() * 5) + 3;
      const usuariosAleatorios = usuarios
        .sort(() => 0.5 - Math.random())
        .slice(0, numUsuariosQueResponden);

      for (const usuario of usuariosAleatorios) {
        const respuestasItem = [];

        // Generar respuesta para cada pregunta de la encuesta
        for (const pregunta of encuesta.preguntas) {
          const respuestaGenerada = generarRespuestasRealisticas(pregunta);
          
          respuestasItem.push({
            idPregunta: pregunta.idPregunta,
            respuesta: respuestaGenerada
          });
        }

        // Crear la respuesta completa
        const nuevaRespuesta = new Respuesta({
          idEncuesta: encuesta._id,
          idUsuario: usuario._id,
          respuestasItem: respuestasItem
        });

        await nuevaRespuesta.save();
        totalRespuestas++;

        console.log(`   ✅ Respuesta creada para usuario: ${usuario.nombre}`);
      }
    }

    console.log(`\n🎉 Seed completado exitosamente!`);
    console.log(`📊 Total de respuestas generadas: ${totalRespuestas}`);
    
    // Mostrar estadísticas por encuesta
    console.log('\n📈 Estadísticas por encuesta:');
    for (const encuesta of encuestas) {
      const numRespuestas = await Respuesta.countDocuments({ idEncuesta: encuesta._id });
      console.log(`   - ${encuesta.nombreEncuesta}: ${numRespuestas} respuestas`);
    }

  } catch (error) {
    console.error('❌ Error durante el seed de respuestas:', error);
  } finally {
    // Cerrar la conexión
    process.exit(0);
  }
};

// Ejecutar el seed si el archivo se ejecuta directamente
if (require.main === module) {
  seedRespuestas();
}

export default seedRespuestas;