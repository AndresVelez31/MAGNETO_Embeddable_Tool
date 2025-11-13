import connectDB from '../config/database';
import { Respuesta } from '../infrastructure/database/models/Respuesta';
import { Encuesta } from '../infrastructure/database/models/Encuesta';
import { Usuario } from '../infrastructure/database/models/Usuario';

/**
 * Lista respuestas de tipo 'abierta' y muestra ejemplos para depuración.
 * Uso: npx ts-node src/scripts/listOpenResponses.ts
 */

const main = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB conectado. Buscando respuestas...');

    const respuestas = await Respuesta.find().lean();
    console.log(`🔎 Total respuestas en DB: ${respuestas.length}`);

    let totalOpen = 0;
    for (const r of respuestas) {
      const usuario = await Usuario.findById((r as any).idUsuario).lean().catch(() => null);
      if (!usuario) {
        // no hay usuario asociado (puede ser anonymous), lo indicamos pero no saltamos
      }
      const encuesta = await Encuesta.findById(r.idEncuesta).lean();
      if (!encuesta) continue;

      const items = (r as any).respuestasItem || [];
      for (const item of items) {
        const pregunta = encuesta.preguntas.find((p: any) => p.idPregunta == item.idPregunta);
        if (!pregunta) continue;
        if (pregunta.tipoPregunta === 'abierta' && typeof item.respuesta === 'string') {
          const text = item.respuesta.trim();
          totalOpen++;
          console.log('\n---');
          console.log(`RespuestaId: ${r._id} | Usuario: ${(usuario && usuario.nombre) || (r as any).idUsuario} | Encuesta: ${encuesta._id} (${encuesta.nombreEncuesta})`);
          console.log(`Pregunta: ${pregunta.contenido}`);
          console.log(`Texto (len=${text.length}): ${text.substring(0, 200)}`);
        }
      }
    }

    console.log('\n🔢 Total respuestas abiertas encontradas:', totalOpen);
    if (totalOpen === 0) {
      console.log('ℹ️  No se encontraron respuestas abiertas de tipo texto. Revisa el esquema de encuestas o los seeds.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en listOpenResponses:', error);
    process.exit(1);
  }
};

if (require.main === module) main();

export default main;
