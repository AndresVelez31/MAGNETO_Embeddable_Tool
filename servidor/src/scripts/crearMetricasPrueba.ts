import connectDB from '../config/database';
import { Respuesta } from '../infrastructure/database/models/Respuesta';
import { Encuesta } from '../infrastructure/database/models/Encuesta';
import { Usuario } from '../infrastructure/database/models/Usuario';
import { Metrica } from '../infrastructure/database/models/Metrica';

const crearMetricasDePrueba = async (): Promise<void> => {
  try {
    console.log('🧪 CREANDO MÉTRICAS DE PRUEBA PARA EL DASHBOARD');
    console.log('=' .repeat(60));

    await connectDB();

    // Obtener una encuesta para asociar la métrica
    const encuesta = await Encuesta.findOne({ estado: 'activa' });
    
    if (!encuesta) {
      console.log('❌ No hay encuestas activas. Ejecuta el seed de encuestas primero.');
      return;
    }

    // Crear métricas de prueba
    const metricaPrueba = {
      idEncuesta: encuesta._id.toString(),
      nombreEncuesta: encuesta.nombreEncuesta,
      totalRespuestas: 15,
      clasificaciones: {
        "satisfacción con el servicio": {
          cantidad: 6,
          porcentaje: 40.0,
          confianzaPromedio: 0.87
        },
        "sugerencia de mejora": {
          cantidad: 4,
          porcentaje: 26.7,
          confianzaPromedio: 0.76
        },
        "queja por mal funcionamiento": {
          cantidad: 3,
          porcentaje: 20.0,
          confianzaPromedio: 0.82
        },
        "comentario neutro": {
          cantidad: 2,
          porcentaje: 13.3,
          confianzaPromedio: 0.65
        }
      },
      sentimientoGeneral: {
        positivo: 8,
        negativo: 4,
        neutro: 3
      },
      fechaAnalisis: new Date()
    };

    // Guardar en la base de datos
    await Metrica.findOneAndUpdate(
      { idEncuesta: encuesta._id },
      { 
        idEncuesta: encuesta._id,
        contenido: metricaPrueba,
        actualizadaEn: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Métrica de prueba creada para: ${encuesta.nombreEncuesta}`);
    console.log(`📊 Total respuestas simuladas: ${metricaPrueba.totalRespuestas}`);
    console.log(`😊 Sentimiento positivo: ${metricaPrueba.sentimientoGeneral.positivo}`);
    console.log(`😞 Sentimiento negativo: ${metricaPrueba.sentimientoGeneral.negativo}`);
    console.log(`😐 Sentimiento neutro: ${metricaPrueba.sentimientoGeneral.neutro}`);

    // Crear una segunda métrica para otra encuesta
    const segundaEncuesta = await Encuesta.findOne({ 
      estado: 'activa', 
      _id: { $ne: encuesta._id } 
    });

    if (segundaEncuesta) {
      const segundaMetrica = {
        idEncuesta: segundaEncuesta._id.toString(),
        nombreEncuesta: segundaEncuesta.nombreEncuesta,
        totalRespuestas: 22,
        clasificaciones: {
          "felicitación": {
            cantidad: 8,
            porcentaje: 36.4,
            confianzaPromedio: 0.91
          },
          "experiencia positiva": {
            cantidad: 7,
            porcentaje: 31.8,
            confianzaPromedio: 0.84
          },
          "problema técnico": {
            cantidad: 4,
            porcentaje: 18.2,
            confianzaPromedio: 0.78
          },
          "solicitud de información": {
            cantidad: 3,
            porcentaje: 13.6,
            confianzaPromedio: 0.69
          }
        },
        sentimientoGeneral: {
          positivo: 15,
          negativo: 4,
          neutro: 3
        },
        fechaAnalisis: new Date()
      };

      await Metrica.findOneAndUpdate(
        { idEncuesta: segundaEncuesta._id },
        { 
          idEncuesta: segundaEncuesta._id,
          contenido: segundaMetrica,
          actualizadaEn: new Date()
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Segunda métrica de prueba creada para: ${segundaEncuesta.nombreEncuesta}`);
    }

    console.log('\n🎉 MÉTRICAS DE PRUEBA CREADAS EXITOSAMENTE');
    console.log('💡 Ahora puedes ver el dashboard en la aplicación web');

  } catch (error) {
    console.error('❌ Error creando métricas de prueba:', error);
  } finally {
    process.exit(0);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  crearMetricasDePrueba();
}

export default crearMetricasDePrueba;