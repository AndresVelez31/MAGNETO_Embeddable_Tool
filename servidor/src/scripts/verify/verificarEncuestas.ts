import connectDB from '../../config/database';
import { Encuesta } from '../../infrastructure/database/models/Encuesta';

const verificarEncuestas = async (): Promise<void> => {
  try {
    console.log('🔍 Verificando encuestas en la base de datos...\n');

    // Conectar a la base de datos
    await connectDB();

    // Obtener todas las encuestas
    const encuestas = await Encuesta.find({}).sort({ creadaEn: -1 });

    if (encuestas.length === 0) {
      console.log('❌ No se encontraron encuestas en la base de datos');
      return;
    }

    console.log(`📋 Total de encuestas encontradas: ${encuestas.length}\n`);

    // Mostrar resumen por estado
    const resumenPorEstado = encuestas.reduce((acc: any, encuesta) => {
      acc[encuesta.estado] = (acc[encuesta.estado] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Resumen por estado:');
    Object.entries(resumenPorEstado).forEach(([estado, cantidad]) => {
      console.log(`   - ${estado}: ${cantidad} encuesta(s)`);
    });

    // Mostrar resumen por tipo
    const resumenPorTipo = encuestas.reduce((acc: any, encuesta) => {
      acc[encuesta.tipoEncuesta] = (acc[encuesta.tipoEncuesta] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🏷️ Resumen por tipo:');
    Object.entries(resumenPorTipo).forEach(([tipo, cantidad]) => {
      console.log(`   - ${tipo}: ${cantidad} encuesta(s)`);
    });

    console.log('\n📝 Detalle de encuestas:');
    console.log('=' .repeat(80));

    encuestas.forEach((encuesta, index) => {
      console.log(`\n${index + 1}. ${encuesta.nombreEncuesta}`);
      console.log(`   📌 ID: ${encuesta._id}`);
      console.log(`   🏷️  Tipo: ${encuesta.tipoEncuesta}`);
      console.log(`   🏢 Empresa: ${encuesta.empresaRelacionada || 'No especificada'}`);
      console.log(`   📊 Estado: ${encuesta.estado}`);
      console.log(`   ❓ Preguntas: ${encuesta.preguntas.length}`);
      console.log(`   📅 Creada: ${(encuesta as any).creadaEn?.toLocaleString('es-ES') || 'No disponible'}`);
      
      // Mostrar tipos de preguntas
      const tiposPreguntas = encuesta.preguntas.reduce((acc: any, pregunta) => {
        acc[pregunta.tipoPregunta] = (acc[pregunta.tipoPregunta] || 0) + 1;
        return acc;
      }, {});

      if (Object.keys(tiposPreguntas).length > 0) {
        console.log(`   🔤 Tipos de preguntas: ${Object.entries(tiposPreguntas).map(([tipo, cantidad]) => `${tipo}(${cantidad})`).join(', ')}`);
      }
    });

    console.log('\n' + '=' .repeat(80));
    console.log('✅ Verificación completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    // Cerrar la conexión
    process.exit(0);
  }
};

// Ejecutar la verificación si el archivo se ejecuta directamente
if (require.main === module) {
  verificarEncuestas();
}

export default verificarEncuestas;