import connectDB from '../config/database';
import { Respuesta } from '../infrastructure/database/models/Respuesta';
import { Encuesta } from '../infrastructure/database/models/Encuesta';
import { Usuario } from '../infrastructure/database/models/Usuario';

const explorarBD = async (): Promise<void> => {
  try {
    console.log('🔍 EXPLORANDO LA ESTRUCTURA DE LA BASE DE DATOS\n');
    console.log('=' .repeat(60));

    await connectDB();

    // 1. MOSTRAR ESTRUCTURA DE USUARIOS
    console.log('\n1️⃣ ESTRUCTURA DE USUARIOS:');
    console.log('-'.repeat(40));
    const usuario = await Usuario.findOne();
    if (usuario) {
      console.log('📄 Ejemplo de documento Usuario:');
      console.log(JSON.stringify(usuario.toObject(), null, 2));
    }

    // 2. MOSTRAR ESTRUCTURA DE ENCUESTAS
    console.log('\n\n2️⃣ ESTRUCTURA DE ENCUESTAS:');
    console.log('-'.repeat(40));
    const encuesta = await Encuesta.findOne();
    if (encuesta) {
      console.log('📄 Ejemplo de documento Encuesta:');
      console.log(JSON.stringify(encuesta.toObject(), null, 2));
    }

    // 3. MOSTRAR ESTRUCTURA DE RESPUESTAS (LO MÁS IMPORTANTE)
    console.log('\n\n3️⃣ ESTRUCTURA DE RESPUESTAS:');
    console.log('-'.repeat(40));
    const respuesta = await Respuesta.findOne()
      .populate('idUsuario', 'nombre username')
      .populate('idEncuesta', 'nombreEncuesta preguntas');
    
    if (respuesta) {
      console.log('📄 Ejemplo de documento Respuesta:');
      console.log(JSON.stringify(respuesta.toObject(), null, 2));
      
      // Mostrar cómo se relacionan las respuestas con las preguntas
      console.log('\n🔗 RELACIÓN PREGUNTA-RESPUESTA:');
      console.log('-'.repeat(40));
      const encuestaCompleta = await Encuesta.findById(respuesta.idEncuesta);
      
      if (encuestaCompleta) {
        respuesta.respuestasItem.forEach((item: any, index: number) => {
          const pregunta = encuestaCompleta.preguntas.id(item.idPregunta);
          console.log(`\n${index + 1}. PREGUNTA ID: ${item.idPregunta}`);
          console.log(`   📝 Contenido: "${pregunta?.contenido || 'No encontrada'}"`);
          console.log(`   🔢 Tipo: ${pregunta?.tipoPregunta || 'N/A'}`);
          console.log(`   ✅ Respuesta: ${JSON.stringify(item.respuesta)}`);
          if (pregunta?.opcionesRespuesta && pregunta.opcionesRespuesta.length > 0) {
            console.log(`   📋 Opciones disponibles:`);
            pregunta.opcionesRespuesta.forEach((opcion: any) => {
              console.log(`      - ${opcion.etiqueta} (valor: ${opcion.valor || opcion.etiqueta})`);
            });
          }
        });
      }
    }

    // 4. ESTADÍSTICAS GENERALES
    console.log('\n\n4️⃣ ESTADÍSTICAS GENERALES:');
    console.log('-'.repeat(40));
    const totalUsuarios = await Usuario.countDocuments();
    const totalEncuestas = await Encuesta.countDocuments();
    const totalRespuestas = await Respuesta.countDocuments();
    
    console.log(`👥 Total Usuarios: ${totalUsuarios}`);
    console.log(`📋 Total Encuestas: ${totalEncuestas}`);
    console.log(`📊 Total Respuestas: ${totalRespuestas}`);

    // 5. TIPOS DE PREGUNTAS Y SUS FORMATOS DE RESPUESTA
    console.log('\n\n5️⃣ TIPOS DE PREGUNTAS Y FORMATOS DE RESPUESTA:');
    console.log('-'.repeat(40));
    
    const encuestas = await Encuesta.find();
    const tiposPreguntas = new Set();
    
    encuestas.forEach(enc => {
      enc.preguntas.forEach((pregunta: any) => {
        tiposPreguntas.add(pregunta.tipoPregunta);
      });
    });

    console.log('📝 Tipos de preguntas encontradas:');
    for (const tipo of tiposPreguntas) {
      console.log(`   - ${tipo}`);
      
      // Buscar ejemplos de respuestas para este tipo
      const ejemploRespuesta = await Respuesta.findOne()
        .populate('idEncuesta');
      
      if (ejemploRespuesta) {
        const encuestaEjemplo = await Encuesta.findById(ejemploRespuesta.idEncuesta);
        if (encuestaEjemplo) {
          const preguntaTipo = encuestaEjemplo.preguntas.find((p: any) => p.tipoPregunta === tipo);
          if (preguntaTipo) {
            const respuestaTipo = (ejemploRespuesta as any).respuestasItem.find((r: any) => 
              r.idPregunta.toString() === preguntaTipo.idPregunta.toString()
            );
            if (respuestaTipo) {
              console.log(`     💡 Ejemplo de respuesta: ${JSON.stringify(respuestaTipo.respuesta)}`);
            }
          }
        }
      }
    }

    console.log('\n✅ Exploración completada');

  } catch (error) {
    console.error('❌ Error durante la exploración:', error);
  } finally {
    process.exit(0);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  explorarBD();
}

export default explorarBD;