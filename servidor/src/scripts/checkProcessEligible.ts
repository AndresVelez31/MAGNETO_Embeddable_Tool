import connectDB from '../config/database';
import { Respuesta } from '../infrastructure/database/models/Respuesta';
import { Encuesta } from '../infrastructure/database/models/Encuesta';
import { Usuario } from '../infrastructure/database/models/Usuario';

/**
 * Replica la lógica de filtrado del procesador para contar cuántas respuestas
 * serían efectivamente procesadas.
 */

const main = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB conectado.');

    const respuestas = await Respuesta.find().lean();
    const usuarios = await Usuario.find().lean();
    const encuestas = await Encuesta.find().lean();

    const usuariosMap = new Map(usuarios.map((u: any) => [u._id.toString(), u]));
    const encuestasMap = new Map(encuestas.map((e: any) => [e._id.toString(), e]));

    let eligibleCount = 0;
    for (const r of respuestas) {
      const usuario = usuariosMap.get((r as any).idUsuario.toString());
      const encuesta = encuestasMap.get((r as any).idEncuesta.toString());
      if (!usuario || !encuesta) continue;

      const items = (r as any).respuestasItem || [];
      for (const item of items) {
        const pregunta = encuesta.preguntas.find((p: any) => p.idPregunta == item.idPregunta);
        if (!pregunta || !item.respuesta) continue;
        if (pregunta.tipoPregunta === 'abierta' && typeof item.respuesta === 'string' && (item.respuesta as string).trim().length > 10) {
          eligibleCount++;
        }
      }
    }

    console.log('🔢 Respuestas elegibles para procesamiento (según lógica actual):', eligibleCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (require.main === module) main();

export default main;
