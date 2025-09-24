import connectDB from '../config/database';
import { Encuesta } from '../models/Encuesta';
import { Types } from 'mongoose';

// Encuestas de prueba con diferentes tipos de preguntas
const encuestasPrueba = [
  {
    tipoEncuesta: "satisfaccion",
    empresaRelacionada: "MAGNETO Tech Solutions",
    estado: "activa",
    nombreEncuesta: "Encuesta de Satisfacción del Cliente",
    preguntas: [
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Cómo calificarías tu experiencia general con nuestro servicio?",
        tipoPregunta: "escala",
        opcionesRespuesta: [
          { etiqueta: "Muy malo", valor: "1", orden: 1 },
          { etiqueta: "Malo", valor: "2", orden: 2 },
          { etiqueta: "Regular", valor: "3", orden: 3 },
          { etiqueta: "Bueno", valor: "4", orden: 4 },
          { etiqueta: "Excelente", valor: "5", orden: 5 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Qué aspectos te gustaron más de nuestro servicio?",
        tipoPregunta: "opcion_multiple",
        opcionesRespuesta: [
          { etiqueta: "Atención al cliente", valor: "atencion_cliente", orden: 1 },
          { etiqueta: "Rapidez en la respuesta", valor: "rapidez", orden: 2 },
          { etiqueta: "Calidad del producto", valor: "calidad", orden: 3 },
          { etiqueta: "Precio competitivo", valor: "precio", orden: 4 },
          { etiqueta: "Facilidad de uso", valor: "facilidad", orden: 5 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Recomendarías nuestros servicios a otros?",
        tipoPregunta: "nps",
        opcionesRespuesta: [
          { etiqueta: "0", valor: "0", orden: 1 },
          { etiqueta: "1", valor: "1", orden: 2 },
          { etiqueta: "2", valor: "2", orden: 3 },
          { etiqueta: "3", valor: "3", orden: 4 },
          { etiqueta: "4", valor: "4", orden: 5 },
          { etiqueta: "5", valor: "5", orden: 6 },
          { etiqueta: "6", valor: "6", orden: 7 },
          { etiqueta: "7", valor: "7", orden: 8 },
          { etiqueta: "8", valor: "8", orden: 9 },
          { etiqueta: "9", valor: "9", orden: 10 },
          { etiqueta: "10", valor: "10", orden: 11 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Tienes algún comentario adicional o sugerencia de mejora?",
        tipoPregunta: "abierta",
        opcionesRespuesta: []
      }
    ]
  },
  {
    tipoEncuesta: "postulacion",
    empresaRelacionada: "MAGNETO Recursos Humanos",
    estado: "activa",
    nombreEncuesta: "Encuesta de Postulación a Empleo",
    preguntas: [
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Cómo te enteraste de esta oportunidad laboral?",
        tipoPregunta: "opcion_unica",
        opcionesRespuesta: [
          { etiqueta: "LinkedIn", valor: "linkedin", orden: 1 },
          { etiqueta: "Página web de la empresa", valor: "web_empresa", orden: 2 },
          { etiqueta: "Referencia de un conocido", valor: "referencia", orden: 3 },
          { etiqueta: "Portal de empleos", valor: "portal_empleos", orden: 4 },
          { etiqueta: "Redes sociales", valor: "redes_sociales", orden: 5 },
          { etiqueta: "Otro", valor: "otro", orden: 6 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Cuáles son tus principales habilidades técnicas?",
        tipoPregunta: "opcion_multiple",
        opcionesRespuesta: [
          { etiqueta: "JavaScript/TypeScript", valor: "javascript", orden: 1 },
          { etiqueta: "Python", valor: "python", orden: 2 },
          { etiqueta: "React/Angular/Vue", valor: "frontend_frameworks", orden: 3 },
          { etiqueta: "Node.js", valor: "nodejs", orden: 4 },
          { etiqueta: "Bases de datos", valor: "databases", orden: 5 },
          { etiqueta: "Cloud (AWS/Azure/GCP)", valor: "cloud", orden: 6 },
          { etiqueta: "DevOps", valor: "devops", orden: 7 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Cuántos años de experiencia tienes en el área?",
        tipoPregunta: "opcion_unica",
        opcionesRespuesta: [
          { etiqueta: "Menos de 1 año", valor: "0-1", orden: 1 },
          { etiqueta: "1-3 años", valor: "1-3", orden: 2 },
          { etiqueta: "3-5 años", valor: "3-5", orden: 3 },
          { etiqueta: "5-10 años", valor: "5-10", orden: 4 },
          { etiqueta: "Más de 10 años", valor: "10+", orden: 5 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "Cuéntanos brevemente sobre tu proyecto más relevante",
        tipoPregunta: "abierta",
        opcionesRespuesta: []
      }
    ]
  },
  {
    tipoEncuesta: "abandono",
    empresaRelacionada: "MAGNETO Retención",
    estado: "activa",
    nombreEncuesta: "Encuesta de Abandono de Servicio",
    preguntas: [
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Cuál es la principal razón por la que decides cancelar el servicio?",
        tipoPregunta: "opcion_unica",
        opcionesRespuesta: [
          { etiqueta: "Precio muy alto", valor: "precio_alto", orden: 1 },
          { etiqueta: "Falta de funcionalidades", valor: "falta_funciones", orden: 2 },
          { etiqueta: "Problemas técnicos frecuentes", valor: "problemas_tecnicos", orden: 3 },
          { etiqueta: "Mal servicio al cliente", valor: "mal_servicio", orden: 4 },
          { etiqueta: "Encontré una mejor alternativa", valor: "mejor_alternativa", orden: 5 },
          { etiqueta: "Ya no necesito el servicio", valor: "no_necesito", orden: 6 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Qué tan probable es que reconsideres usar nuestro servicio en el futuro?",
        tipoPregunta: "escala",
        opcionesRespuesta: [
          { etiqueta: "Muy improbable", valor: "1", orden: 1 },
          { etiqueta: "Improbable", valor: "2", orden: 2 },
          { etiqueta: "Neutral", valor: "3", orden: 3 },
          { etiqueta: "Probable", valor: "4", orden: 4 },
          { etiqueta: "Muy probable", valor: "5", orden: 5 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Qué mejoras te harían considerar quedarte?",
        tipoPregunta: "abierta",
        opcionesRespuesta: []
      }
    ]
  },
  {
    tipoEncuesta: "satisfaccion",
    empresaRelacionada: "MAGNETO E-learning",
    estado: "borrador",
    nombreEncuesta: "Evaluación de Curso Online",
    preguntas: [
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Cómo calificarías el contenido del curso?",
        tipoPregunta: "escala",
        opcionesRespuesta: [
          { etiqueta: "Muy malo", valor: "1", orden: 1 },
          { etiqueta: "Malo", valor: "2", orden: 2 },
          { etiqueta: "Regular", valor: "3", orden: 3 },
          { etiqueta: "Bueno", valor: "4", orden: 4 },
          { etiqueta: "Excelente", valor: "5", orden: 5 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿El instructor fue claro en sus explicaciones?",
        tipoPregunta: "opcion_unica",
        opcionesRespuesta: [
          { etiqueta: "Siempre", valor: "siempre", orden: 1 },
          { etiqueta: "Casi siempre", valor: "casi_siempre", orden: 2 },
          { etiqueta: "A veces", valor: "a_veces", orden: 3 },
          { etiqueta: "Raramente", valor: "raramente", orden: 4 },
          { etiqueta: "Nunca", valor: "nunca", orden: 5 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Qué aspectos del curso te resultaron más útiles?",
        tipoPregunta: "opcion_multiple",
        opcionesRespuesta: [
          { etiqueta: "Ejercicios prácticos", valor: "ejercicios", orden: 1 },
          { etiqueta: "Material teórico", valor: "teoria", orden: 2 },
          { etiqueta: "Videos explicativos", valor: "videos", orden: 3 },
          { etiqueta: "Ejemplos reales", valor: "ejemplos", orden: 4 },
          { etiqueta: "Foros de discusión", valor: "foros", orden: 5 }
        ]
      }
    ]
  },
  {
    tipoEncuesta: "satisfaccion",
    empresaRelacionada: "MAGNETO Healthcare",
    estado: "inactiva",
    nombreEncuesta: "Encuesta de Experiencia del Paciente",
    preguntas: [
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿Cómo fue tu experiencia en la sala de espera?",
        tipoPregunta: "escala",
        opcionesRespuesta: [
          { etiqueta: "Muy mala", valor: "1", orden: 1 },
          { etiqueta: "Mala", valor: "2", orden: 2 },
          { etiqueta: "Regular", valor: "3", orden: 3 },
          { etiqueta: "Buena", valor: "4", orden: 4 },
          { etiqueta: "Excelente", valor: "5", orden: 5 }
        ]
      },
      {
        idPregunta: new Types.ObjectId(),
        contenido: "¿El personal médico te brindó la información necesaria?",
        tipoPregunta: "opcion_unica",
        opcionesRespuesta: [
          { etiqueta: "Completamente", valor: "completamente", orden: 1 },
          { etiqueta: "En su mayoría", valor: "mayoria", orden: 2 },
          { etiqueta: "Parcialmente", valor: "parcialmente", orden: 3 },
          { etiqueta: "Muy poco", valor: "poco", orden: 4 },
          { etiqueta: "Nada", valor: "nada", orden: 5 }
        ]
      }
    ]
  }
];

const seedEncuestas = async (): Promise<void> => {
  try {
    console.log('🌱 Iniciando seed de encuestas...');

    // Conectar a la base de datos
    await connectDB();

    // Limpiar la colección de encuestas (opcional)
    console.log('🗑️ Limpiando encuestas existentes...');
    await Encuesta.deleteMany({});

    // Insertar encuestas de prueba
    console.log('📋 Insertando encuestas de prueba...');
    const encuestasCreadas = await Encuesta.insertMany(encuestasPrueba);

    console.log(`✅ Se crearon ${encuestasCreadas.length} encuestas de prueba exitosamente:`);
    encuestasCreadas.forEach((encuesta: any) => {
      console.log(`   - ${encuesta.nombreEncuesta} (${encuesta.tipoEncuesta}) - ${encuesta.estado}`);
      console.log(`     └─ ${encuesta.preguntas.length} preguntas`);
    });

    console.log('\n📊 Resumen por tipo:');
    const resumen = encuestasCreadas.reduce((acc: any, encuesta: any) => {
      acc[encuesta.tipoEncuesta] = (acc[encuesta.tipoEncuesta] || 0) + 1;
      return acc;
    }, {});

    Object.entries(resumen).forEach(([tipo, cantidad]) => {
      console.log(`   - ${tipo}: ${cantidad} encuesta(s)`);
    });

  } catch (error) {
    console.error('❌ Error durante el seed de encuestas:', error);
  } finally {
    // Cerrar la conexión
    process.exit(0);
  }
};

// Ejecutar el seed si el archivo se ejecuta directamente
if (require.main === module) {
  seedEncuestas();
}

export default seedEncuestas;