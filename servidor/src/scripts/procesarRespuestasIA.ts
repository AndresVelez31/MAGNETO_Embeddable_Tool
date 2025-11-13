import connectDB from '../config/database';
import fs from 'fs';
import path from 'path';

// Importar modelos en orden para evitar problemas de referencia
import { Usuario } from '../infrastructure/database/models/Usuario';
import { Encuesta } from '../infrastructure/database/models/Encuesta';
import { Respuesta } from '../infrastructure/database/models/Respuesta';
import { Metrica } from '../infrastructure/database/models/Metrica';

// Configuración del modelo de Hugging Face
const API_URL = "https://api-inference.huggingface.co/models/joeddav/xlm-roberta-large-xnli";
const HF_API_KEY = process.env.HF_API_KEY || '';
if (!HF_API_KEY) {
  console.warn('⚠️  No se encontró `HF_API_KEY` en las variables de entorno. Configure HF_API_KEY para usar Hugging Face.');
}
const headers = {
  "Authorization": HF_API_KEY ? `Bearer ${HF_API_KEY}` : '',
  "Content-Type": "application/json"
};

// Etiquetas de clasificación que tendrá la IA en cuenta
const etiquetas = [
  "satisfacción con el servicio",
  "queja por mal funcionamiento", 
  "sugerencia de mejora",
  "comentario neutro",
  "problema técnico",
  "felicitación",
  "experiencia positiva",
  "experiencia negativa",
  "solicitud de información",
  "comentario sobre precio"
];

// Interfaces para tipado
interface ClasificacionIA {
  labels: string[];
  scores: number[];
}

interface RespuestaClasificada {
  idRespuesta: string;
  idEncuesta: string;
  idUsuario: string;
  nombreUsuario: string;
  nombreEncuesta: string;
  pregunta: string;
  respuestaTexto: string;
  clasificacion: string;
  confianza: number;
  fechaRespuesta: Date;
}

interface MetricaGenerada {
  idEncuesta: string;
  nombreEncuesta: string;
  totalRespuestas: number;
  clasificaciones: {
    [key: string]: {
      cantidad: number;
      porcentaje: number;
      confianzaPromedio: number;
    }
  };
  sentimientoGeneral: {
    positivo: number;
    negativo: number;
    neutro: number;
  };
  fechaAnalisis: Date;
}

// Función para llamar a la API de Hugging Face
const clasificarTexto = async (texto: string): Promise<ClasificacionIA> => {
  const payload = {
    inputs: texto,
    parameters: {
      candidate_labels: etiquetas,
      multi_label: false
    }
  };

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.status === 429) {
        // Rate limited: esperar y reintentar
        const waitMs = 500 * Math.pow(2, attempt);
        console.warn(`🔁 Rate limit recibido de Hugging Face, reintentando en ${waitMs}ms (intento ${attempt + 1})`);
        await new Promise(r => setTimeout(r, waitMs));
        attempt++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('❌ Error clasificando texto (intento', attempt + 1, '):', error);
      attempt++;
      const waitMs = 300 * attempt;
      await new Promise(r => setTimeout(r, waitMs));
    }
  }

  // Si agotamos reintentos, devolver valor por defecto
  return {
    labels: ["comentario neutro"],
    scores: [0.5]
  };
};

// Función para determinar sentimiento general
const determinarSentimiento = (clasificacion: string): 'positivo' | 'negativo' | 'neutro' => {
  const positivos = ['satisfacción con el servicio', 'felicitación', 'experiencia positiva'];
  const negativos = ['queja por mal funcionamiento', 'problema técnico', 'experiencia negativa'];
  
  if (positivos.includes(clasificacion)) return 'positivo';
  if (negativos.includes(clasificacion)) return 'negativo';
  return 'neutro';
};

// Función principal para procesar respuestas
const procesarRespuestasIA = async (): Promise<void> => {
  try {
    console.log('🤖 INICIANDO PROCESAMIENTO CON IA DE RESPUESTAS');
    console.log('=' .repeat(60));

    await connectDB();

    // 1. Obtener todas las respuestas SIN populate para evitar errores
    console.log('\n📊 Obteniendo respuestas de la base de datos...');
    const respuestas = await Respuesta.find();
    
    // Obtener usuarios y encuestas por separado
    const usuarios = await Usuario.find();
    const encuestas = await Encuesta.find();
    
    // Crear mapas para búsqueda rápida
    const usuariosMap = new Map(usuarios.map((u: any) => [u._id.toString(), u]));
    const encuestasMap = new Map(encuestas.map((e: any) => [e._id.toString(), e]));

    console.log(`✅ Se encontraron ${respuestas.length} respuestas para procesar\n`);

    const respuestasClasificadas: RespuestaClasificada[] = [];

    // 2. Procesar cada respuesta
    for (let i = 0; i < respuestas.length; i++) {
      const respuesta = respuestas[i];
      console.log(`🔄 Procesando respuesta ${i + 1}/${respuestas.length}...`);

      // Obtener usuario y encuesta de los mapas
      const usuario = usuariosMap.get(respuesta.idUsuario.toString()) as any;
      const encuestaCompleta = encuestasMap.get(respuesta.idEncuesta.toString()) as any;
      
      if (!encuestaCompleta || !usuario) continue;

      // Procesar cada item de respuesta
      const respuestasItems = (respuesta as any).respuestasItem as any[];
      for (const item of respuestasItems) {
        // Buscar la pregunta de forma robusta: usar .id() si está disponible, si no, buscar en el array
        let pregunta: any = undefined;
        try {
          if (encuestaCompleta.preguntas && typeof encuestaCompleta.preguntas.id === 'function') {
            pregunta = encuestaCompleta.preguntas.id(item.idPregunta);
          }
        } catch (e) {
          // ignorar
        }

        if (!pregunta) {
          const preguntasArr = encuestaCompleta.preguntas || [];
          pregunta = preguntasArr.find((p: any) => {
            if (!p) return false;
            const pid = p._id ? p._id.toString() : (p.id ? p.id.toString() : (p.idPregunta ? p.idPregunta.toString() : undefined));
            return pid === (item.idPregunta ? item.idPregunta.toString() : String(item.idPregunta));
          });
        }

        if (!pregunta || !item.respuesta) {
          if (!pregunta) console.warn(`  ⚠️ Pregunta no encontrada para idPregunta=${item.idPregunta} en encuesta ${encuestaCompleta._id}`);
          continue;
        }

        // Solo procesar respuestas de texto (preguntas abiertas) y que no estén vacías
        if (pregunta.tipoPregunta === 'abierta' && 
          typeof item.respuesta === 'string' && 
          (item.respuesta as string).trim().length > 10) {
          
          console.log(`  📝 Pregunta abierta encontrada: "${pregunta.contenido}"`);
          console.log(`  📝 Clasificando respuesta: "${(item.respuesta as string).substring(0, 50)}..."`);
          
          // Clasificar con IA
          const clasificacion = await clasificarTexto((item.respuesta as string).trim());
          
          const respuestaClasificada: RespuestaClasificada = {
            idRespuesta: respuesta._id.toString(),
            idEncuesta: respuesta.idEncuesta.toString(),
            idUsuario: respuesta.idUsuario.toString(),
            nombreUsuario: usuario.nombre,
            nombreEncuesta: encuestaCompleta.nombreEncuesta,
            pregunta: pregunta.contenido,
            respuestaTexto: item.respuesta,
            clasificacion: clasificacion.labels[0],
            confianza: clasificacion.scores[0],
            fechaRespuesta: (respuesta as any).creadaEn || new Date()
          };

          respuestasClasificadas.push(respuestaClasificada);
          console.log(`  ✅ Clasificado como: ${clasificacion.labels[0]} (${(clasificacion.scores[0] * 100).toFixed(1)}%)`);
          
          // Pequeña pausa para no saturar la API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // 3. Generar métricas por encuesta
    console.log('\n📈 Generando métricas por encuesta...');
    const metricasPorEncuesta = new Map<string, MetricaGenerada>();

    respuestasClasificadas.forEach(resp => {
      if (!metricasPorEncuesta.has(resp.idEncuesta)) {
        metricasPorEncuesta.set(resp.idEncuesta, {
          idEncuesta: resp.idEncuesta,
          nombreEncuesta: resp.nombreEncuesta,
          totalRespuestas: 0,
          clasificaciones: {},
          sentimientoGeneral: { positivo: 0, negativo: 0, neutro: 0 },
          fechaAnalisis: new Date()
        });
      }

      const metrica = metricasPorEncuesta.get(resp.idEncuesta)!;
      metrica.totalRespuestas++;

      // Agregar clasificación
      if (!metrica.clasificaciones[resp.clasificacion]) {
        metrica.clasificaciones[resp.clasificacion] = {
          cantidad: 0,
          porcentaje: 0,
          confianzaPromedio: 0
        };
      }

      const clasif = metrica.clasificaciones[resp.clasificacion];
      const prevCantidad = clasif.cantidad;
      // Incrementar conteo y recalcular promedio de confianza correctamente
      clasif.cantidad = prevCantidad + 1;
      clasif.confianzaPromedio = ((clasif.confianzaPromedio * prevCantidad) + resp.confianza) / clasif.cantidad;

      // Actualizar sentimiento general
      const sentimiento = determinarSentimiento(resp.clasificacion);
      metrica.sentimientoGeneral[sentimiento]++;
    });

    // Calcular porcentajes
    metricasPorEncuesta.forEach(metrica => {
      Object.keys(metrica.clasificaciones).forEach(key => {
          metrica.clasificaciones[key].porcentaje = 
            (metrica.clasificaciones[key].cantidad / metrica.totalRespuestas) * 100;
        });
        // Añadir campo opcional topClasificacion para facilitar consumo en frontend
        const keys = Object.keys(metrica.clasificaciones);
        if (keys.length) {
          let top = keys[0];
          let maxCount = metrica.clasificaciones[top].cantidad;
          for (const k of keys) {
            if (metrica.clasificaciones[k].cantidad > maxCount) {
              top = k;
              maxCount = metrica.clasificaciones[k].cantidad;
            }
          }
          // Guardar top calculado en el objeto de métricas
          (metrica as any).topClasificacion = top;
        }
    });

    // 4. Guardar métricas en la base de datos
    console.log('\n💾 Guardando métricas en la base de datos...');
    for (const [idEncuesta, metrica] of metricasPorEncuesta) {
      await Metrica.findOneAndUpdate(
        { idEncuesta: idEncuesta },
        { 
          idEncuesta: idEncuesta,
          contenido: metrica,
          actualizadaEn: new Date()
        },
        { upsert: true, new: true }
      );
      console.log(`  ✅ Métricas guardadas para: ${metrica.nombreEncuesta}`);
    }

    // 5. Guardar resultados en CSV
    console.log('\n📄 Generando reporte CSV...');
    const csvPath = path.join(__dirname, '../../../resultados_encuesta_ia.csv');
    const quote = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
    const csvRows = [] as string[];
    csvRows.push(['ID Respuesta', 'Encuesta', 'Usuario', 'Pregunta', 'Respuesta', 'Clasificación', 'Confianza', 'Fecha'].map(quote).join(','));
    for (const r of respuestasClasificadas) {
      csvRows.push([
        r.idRespuesta,
        r.nombreEncuesta,
        r.nombreUsuario,
        r.pregunta,
        r.respuestaTexto,
        r.clasificacion,
        r.confianza.toFixed(4),
        r.fechaRespuesta.toISOString()
      ].map(quote).join(','));
    }
    const csvContent = csvRows.join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf-8');
    console.log(`✅ Reporte CSV guardado en: ${csvPath}`);

    // 6. Mostrar resumen final
    console.log('\n🎉 PROCESAMIENTO COMPLETADO');
    console.log('=' .repeat(60));
    console.log(`📊 Total de respuestas clasificadas: ${respuestasClasificadas.length}`);
    console.log(`📈 Encuestas procesadas: ${metricasPorEncuesta.size}`);
    
    console.log('\n📋 Resumen por encuesta:');
    metricasPorEncuesta.forEach(metrica => {
      console.log(`\n🔸 ${metrica.nombreEncuesta}:`);
      console.log(`   📊 Total respuestas: ${metrica.totalRespuestas}`);
      console.log(`   😊 Positivas: ${metrica.sentimientoGeneral.positivo}`);
      console.log(`   😐 Neutras: ${metrica.sentimientoGeneral.neutro}`);
      console.log(`   😞 Negativas: ${metrica.sentimientoGeneral.negativo}`);
      console.log(`   🏷️ Top clasificación: ${(metrica as any).topClasificacion || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error durante el procesamiento:', error);
  } finally {
    process.exit(0);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  procesarRespuestasIA();
}

export default procesarRespuestasIA;