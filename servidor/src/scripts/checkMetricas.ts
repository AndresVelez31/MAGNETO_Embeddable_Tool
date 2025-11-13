import connectDB from '../config/database';
import { Metrica } from '../infrastructure/database/models/Metrica';
import { Encuesta } from '../infrastructure/database/models/Encuesta';

/**
 * Script simple para verificar si hay métricas en la base de datos.
 * Uso:
 *  - `ts-node src/scripts/checkMetricas.ts` -> resumen general
 *  - `ts-node src/scripts/checkMetricas.ts --id=<ID_ENCUESTA>` -> métricas para encuesta
 */

const parseArg = (name: string) => {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  if (!arg) return null;
  return arg.split('=')[1];
};

const main = async () => {
  try {
    await connectDB();
    const idEncuesta = parseArg('id');

    if (idEncuesta) {
      console.log(`🔎 Buscando métricas para encuesta: ${idEncuesta}`);
      const count = await Metrica.countDocuments({ idEncuesta });
      console.log(`📊 Métricas encontradas: ${count}`);
      if (count > 0) {
        const docs = await Metrica.find({ idEncuesta }).sort({ creadaEn: -1 }).limit(10).lean();
        docs.forEach((d: any, i: number) => {
          console.log(`\n=== Métrica ${i + 1} — creadaEn: ${d.creadaEn} — actualizadaEn: ${d.actualizadaEn}`);
          console.log(JSON.stringify(d.contenido, null, 2));
        });
      }
      process.exit(0);
    }

    // Resumen general
    const total = await Metrica.countDocuments();
    console.log(`🤖 Resumen de métricas en la base de datos`);
    console.log(`📦 Total de documentos en colección 'metrica': ${total}`);

    if (total === 0) {
      console.log('ℹ️  No hay métricas almacenadas aún. Ejecuta el procesamiento (process:ia) o crear métricas de prueba.');
      process.exit(0);
    }

    // Últimas métricas globales
    const recientes = await Metrica.find().sort({ creadaEn: -1 }).limit(10).lean();
    console.log(`\n🕘 Últimas ${recientes.length} métricas:`);
    recientes.forEach((m: any, idx: number) => {
      console.log(`- [${idx + 1}] Encuesta: ${m.contenido?.nombreEncuesta || m.idEncuesta} | totalRespuestas: ${m.contenido?.totalRespuestas || 'N/A'} | creadaEn: ${m.creadaEn}`);
    });

    // Conteo por encuesta (top 10)
    const agg = await Metrica.aggregate([
      { $group: { _id: '$idEncuesta', count: { $sum: 1 }, last: { $max: '$creadaEn' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    if (agg.length) {
      console.log('\n📌 Métricas por encuesta (top 10):');
      for (const a of agg) {
        // intentar resolver nombre de encuesta
        let nombre = a._id;
        try {
          const enc = await Encuesta.findById(a._id).lean();
          if (enc && enc.nombreEncuesta) nombre = enc.nombreEncuesta;
        } catch (e) {/* ignore */}
        console.log(`- Encuesta: ${nombre} | documentos: ${a.count} | última: ${a.last}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verificando métricas:', error);
    process.exit(1);
  }
};

if (require.main === module) main();

export default main;
