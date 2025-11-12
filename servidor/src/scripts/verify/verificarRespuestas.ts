import connectDB from '../../config/database';
import { Respuesta } from '../../infrastructure/database/models/Respuesta';
import { Encuesta } from '../../infrastructure/database/models/Encuesta';
import { Usuario } from '../../infrastructure/database/models/Usuario';

const verifyRespuestas = async (): Promise<void> => {
  try {
    console.log('🔍 Verificando respuestas en la base de datos...\n');

    // Conectar a la base de datos
    await connectDB();

    // Contar total de respuestas
    const totalRespuestas = await Respuesta.countDocuments();
    console.log(`📊 Total de respuestas en la base de datos: ${totalRespuestas}\n`);

    if (totalRespuestas === 0) {
      console.log('⚠️ No se encontraron respuestas. Asegúrate de enviar algunas respuestas desde la aplicación.');
      return;
    }

    // Mostrar las respuestas más recientes
    console.log('� RESPUESTAS MÁS RECIENTES:');
    console.log('=' .repeat(50));
    
    const respuestasRecientes = await Respuesta.find()
      .sort({ _id: -1 }) // Ordenar por _id descendente (más recientes primero)
      .limit(5)
      .populate('idEncuesta', 'nombreEncuesta tipoEncuesta');

    for (const [index, respuesta] of respuestasRecientes.entries()) {
      console.log(`\n${index + 1}. Respuesta ID: ${respuesta._id}`);
      console.log(`   � Encuesta: ${(respuesta.idEncuesta as any)?.nombreEncuesta || 'Encuesta no encontrada'}`);
      console.log(`   🏷️ Tipo: ${(respuesta.idEncuesta as any)?.tipoEncuesta || 'No disponible'}`);
      console.log(`   � Usuario: ${respuesta.idUsuario}`);
      console.log(`   📋 Número de respuestas: ${respuesta.respuestasItem?.length || 0}`);
      
      // Mostrar las respuestas si existen
      if (respuesta.respuestasItem && respuesta.respuestasItem.length > 0) {
        console.log(`   💬 Respuestas:`);
        respuesta.respuestasItem.forEach((item: any, idx: number) => {
          console.log(`      ${idx + 1}. Pregunta ${item.idPregunta}: ${JSON.stringify(item.respuesta)}`);
        });
      } else {
        console.log(`   � Sin respuestas (posiblemente "no respondió")`);
      }
    }

    // Obtener estadísticas por encuesta
    console.log('\n\n📈 Estadísticas por encuesta:');
    console.log('=' .repeat(50));
    
    const encuestas = await Encuesta.find({});
    
    for (const encuesta of encuestas) {
      const numRespuestas = await Respuesta.countDocuments({ idEncuesta: encuesta._id });
      console.log(`\n🔸 ${encuesta.nombreEncuesta}`);
      console.log(`   📊 Respuestas: ${numRespuestas}`);
      console.log(`   📋 Estado: ${encuesta.estado}`);
      console.log(`   🏷️ Tipo: ${encuesta.tipoEncuesta}`);
      console.log(`   ❓ Preguntas: ${encuesta.preguntas.length}`);
    }

    // Mostrar estadísticas de usuarios anónimos
    console.log('\n\n� Estadísticas de usuarios anónimos:');
    console.log('=' .repeat(50));
    
    const usuariosAnonimos = await Respuesta.countDocuments({ 
      idUsuario: '000000000000000000000000' 
    });
    const respuestasCompletas = await Respuesta.countDocuments({
      respuestasItem: { $exists: true, $not: { $size: 0 } }
    });
    const respuestasVacias = await Respuesta.countDocuments({
      $or: [
        { respuestasItem: { $exists: false } },
        { respuestasItem: { $size: 0 } }
      ]
    });
    
    console.log(`� Respuestas de usuarios anónimos: ${usuariosAnonimos}`);
    console.log(`✅ Respuestas completas: ${respuestasCompletas}`);
    console.log(`📋 Respuestas vacías (no respondió): ${respuestasVacias}`);

    // Mostrar ejemplo detallado de una respuesta reciente
    console.log('\n\n📝 Ejemplo detallado de respuesta más reciente:');
    console.log('=' .repeat(50));
    
    const respuestaEjemplo = await Respuesta.findOne()
      .sort({ _id: -1 })
      .populate('idEncuesta', 'nombreEncuesta tipoEncuesta');
    
    if (respuestaEjemplo) {
      console.log(`\n👤 Usuario: ${respuestaEjemplo.idUsuario.toString() === '000000000000000000000000' ? 'Usuario Anónimo' : respuestaEjemplo.idUsuario}`);
      console.log(`📋 Encuesta: ${(respuestaEjemplo.idEncuesta as any)?.nombreEncuesta || 'No disponible'}`);
      console.log(`🏷️ Tipo: ${(respuestaEjemplo.idEncuesta as any)?.tipoEncuesta || 'No disponible'}`);
      console.log(`📊 Número de respuestas: ${respuestaEjemplo.respuestasItem.length}`);
      
      // Obtener la encuesta completa para mostrar preguntas con respuestas
      const encuestaCompleta = await Encuesta.findById(respuestaEjemplo.idEncuesta);
      
      if (encuestaCompleta && respuestaEjemplo.respuestasItem.length > 0) {
        console.log('\n🔍 Detalle de respuestas:');
        respuestaEjemplo.respuestasItem.forEach((item: any) => {
          const pregunta = encuestaCompleta.preguntas.id(item.idPregunta);
          if (pregunta) {
            console.log(`\n   ❓ Pregunta: ${pregunta.contenido}`);
            console.log(`   📋 Tipo: ${pregunta.tipoPregunta}`);
            console.log(`   ✅ Respuesta: ${JSON.stringify(item.respuesta, null, 2)}`);
          }
        });
      } else if (respuestaEjemplo.respuestasItem.length === 0) {
        console.log('\n   📝 Esta es una respuesta vacía (usuario no respondió)');
      }
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    // Cerrar la conexión
    process.exit(0);
  }
};

// Ejecutar la verificación si el archivo se ejecuta directamente
if (require.main === module) {
  verifyRespuestas();
}

export default verifyRespuestas;