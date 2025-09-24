import connectDB from '../config/database';
import { Respuesta } from '../models/Respuesta';
import { Encuesta } from '../models/Encuesta';
import { Usuario } from '../models/Usuario';

const verifyRespuestas = async (): Promise<void> => {
  try {
    console.log('🔍 Verificando respuestas en la base de datos...\n');

    // Conectar a la base de datos
    await connectDB();

    // Contar total de respuestas
    const totalRespuestas = await Respuesta.countDocuments();
    console.log(`📊 Total de respuestas en la base de datos: ${totalRespuestas}\n`);

    if (totalRespuestas === 0) {
      console.log('⚠️ No se encontraron respuestas. Ejecuta el seed de respuestas primero.');
      return;
    }

    // Obtener estadísticas por encuesta
    console.log('📈 Estadísticas por encuesta:');
    console.log('=' .repeat(50));
    
    const encuestas = await Encuesta.find({});
    
    for (const encuesta of encuestas) {
      const numRespuestas = await Respuesta.countDocuments({ idEncuesta: encuesta._id });
      console.log(`\n🔸 ${encuesta.nombreEncuesta}`);
      console.log(`   📊 Respuestas: ${numRespuestas}`);
      console.log(`   📋 Estado: ${encuesta.estado}`);
      console.log(`   ❓ Preguntas: ${encuesta.preguntas.length}`);
      
      if (numRespuestas > 0) {
        // Mostrar algunas respuestas de ejemplo
        const respuestasEjemplo = await Respuesta.find({ idEncuesta: encuesta._id })
          .populate('idUsuario', 'nombre username')
          .limit(2);
          
        console.log('   👤 Usuarios que respondieron (ejemplo):');
        respuestasEjemplo.forEach((respuesta: any) => {
          console.log(`      - ${respuesta.idUsuario.nombre} (${respuesta.idUsuario.username})`);
        });
      }
    }

    // Obtener estadísticas por usuario
    console.log('\n\n👥 Estadísticas por usuario:');
    console.log('=' .repeat(50));
    
    const usuarios = await Usuario.find({});
    
    for (const usuario of usuarios) {
      const numRespuestas = await Respuesta.countDocuments({ idUsuario: usuario._id });
      if (numRespuestas > 0) {
        console.log(`🔸 ${usuario.nombre} (${usuario.username}): ${numRespuestas} respuestas`);
      }
    }

    // Mostrar ejemplo detallado de una respuesta
    console.log('\n\n📝 Ejemplo detallado de respuesta:');
    console.log('=' .repeat(50));
    
    const respuestaEjemplo = await Respuesta.findOne()
      .populate('idUsuario', 'nombre username')
      .populate('idEncuesta', 'nombreEncuesta');
    
    if (respuestaEjemplo) {
      console.log(`\n👤 Usuario: ${(respuestaEjemplo as any).idUsuario.nombre}`);
      console.log(`📋 Encuesta: ${(respuestaEjemplo as any).idEncuesta.nombreEncuesta}`);
      console.log(`📅 Fecha: ${(respuestaEjemplo as any).creadaEn?.toLocaleString('es-ES') || 'No disponible'}`);
      console.log(`📊 Número de respuestas: ${respuestaEjemplo.respuestasItem.length}`);
      
      // Obtener la encuesta completa para mostrar preguntas con respuestas
      const encuestaCompleta = await Encuesta.findById(respuestaEjemplo.idEncuesta);
      
      if (encuestaCompleta) {
        console.log('\n🔍 Detalle de respuestas:');
        respuestaEjemplo.respuestasItem.forEach((item: any) => {
          const pregunta = encuestaCompleta.preguntas.id(item.idPregunta);
          if (pregunta) {
            console.log(`\n   ❓ Pregunta: ${pregunta.contenido}`);
            console.log(`   📋 Tipo: ${pregunta.tipoPregunta}`);
            console.log(`   ✅ Respuesta: ${JSON.stringify(item.respuesta, null, 2)}`);
          }
        });
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