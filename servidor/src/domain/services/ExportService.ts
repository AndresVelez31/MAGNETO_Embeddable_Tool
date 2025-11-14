/**
 * ExportService - Servicio para exportar métricas en diferentes formatos
 * Principio: Single Responsibility - Solo maneja la exportación de datos
 */

import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface MetricsExportData {
  periodo: string;
  fechaGeneracion: string;
  filtros?: {
    empresa?: string;
    area?: string;
    dias?: number;
  };
  resumenGeneral: {
    totalRespuestas: number;
    respuestasCompletas: number;
    respuestasAbandonadas: number;
    tasaCompletado: number;
    tasaAbandono: number;
    encuestasActivas: number;
  };
  respuestasPorTipo: Array<{
    tipo: string;
    completadas: number;
    parciales: number;
    abandonadas: number;
    total: number;
  }>;
  distribucionRespuestas?: {
    completadas: number;
    parciales: number;
    abandonadas: number;
  };
  distribucionSatisfaccion?: {
    buena: number;
    regular: number;
    mala: number;
  };
}

export class ExportService {
  /**
   * Genera un archivo CSV con las métricas
   */
  static async generateCSV(data: MetricsExportData): Promise<string> {
    try {
      // Preparar datos planos para CSV
      const flatData = [
        {
          seccion: 'Resumen General',
          metrica: 'Total Respuestas',
          valor: data.resumenGeneral.totalRespuestas,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        },
        {
          seccion: 'Resumen General',
          metrica: 'Respuestas Completas',
          valor: data.resumenGeneral.respuestasCompletas,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        },
        {
          seccion: 'Resumen General',
          metrica: 'Respuestas Abandonadas',
          valor: data.resumenGeneral.respuestasAbandonadas,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        },
        {
          seccion: 'Resumen General',
          metrica: 'Tasa de Completado (%)',
          valor: data.resumenGeneral.tasaCompletado,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        },
        {
          seccion: 'Resumen General',
          metrica: 'Tasa de Abandono (%)',
          valor: data.resumenGeneral.tasaAbandono,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        },
        {
          seccion: 'Resumen General',
          metrica: 'Encuestas Activas',
          valor: data.resumenGeneral.encuestasActivas,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        }
      ];

      // Agregar respuestas por tipo
      data.respuestasPorTipo.forEach(tipo => {
        flatData.push({
          seccion: `Respuestas por Tipo - ${tipo.tipo}`,
          metrica: 'Completadas',
          valor: tipo.completadas,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        });
        flatData.push({
          seccion: `Respuestas por Tipo - ${tipo.tipo}`,
          metrica: 'Parciales',
          valor: tipo.parciales,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        });
        flatData.push({
          seccion: `Respuestas por Tipo - ${tipo.tipo}`,
          metrica: 'Abandonadas',
          valor: tipo.abandonadas,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        });
        flatData.push({
          seccion: `Respuestas por Tipo - ${tipo.tipo}`,
          metrica: 'Total',
          valor: tipo.total,
          periodo: data.periodo,
          empresa: data.filtros?.empresa || 'Todas',
          area: data.filtros?.area || 'Todas'
        });
      });

      const fields = ['seccion', 'metrica', 'valor', 'periodo', 'empresa', 'area'];
      const opts = { fields, header: true };
      const parser = new Parser(opts);
      const csv = parser.parse(flatData);

      return csv;
    } catch (error) {
      throw new Error(`Error generando CSV: ${error}`);
    }
  }

  /**
   * Genera un archivo PDF con las métricas
   */
  static async generatePDF(data: MetricsExportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).fillColor('#2563eb').text('Reporte de Métricas', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#666').text(`Fecha de generación: ${data.fechaGeneracion}`, { align: 'center' });
        doc.text(`Período: ${data.periodo}`, { align: 'center' });
        
        if (data.filtros?.empresa || data.filtros?.area) {
          doc.moveDown(0.3);
          if (data.filtros?.empresa) {
            doc.text(`Empresa: ${data.filtros.empresa}`, { align: 'center' });
          }
          if (data.filtros?.area) {
            doc.text(`Área: ${data.filtros.area}`, { align: 'center' });
          }
        }

        doc.moveDown(1.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);

        // Resumen General
        doc.fontSize(14).fillColor('#000').text('Resumen General', { underline: true });
        doc.moveDown(0.5);
        
        const resumen = data.resumenGeneral;
        doc.fontSize(10).fillColor('#333');
        doc.text(`Total de Respuestas: ${resumen.totalRespuestas}`, { indent: 20 });
        doc.text(`Respuestas Completas: ${resumen.respuestasCompletas}`, { indent: 20 });
        doc.text(`Respuestas Abandonadas: ${resumen.respuestasAbandonadas}`, { indent: 20 });
        doc.text(`Tasa de Completado: ${resumen.tasaCompletado}%`, { indent: 20 });
        doc.text(`Tasa de Abandono: ${resumen.tasaAbandono}%`, { indent: 20 });
        doc.text(`Encuestas Activas: ${resumen.encuestasActivas}`, { indent: 20 });

        doc.moveDown(1.5);

        // Respuestas por Tipo
        doc.fontSize(14).fillColor('#000').text('Respuestas por Tipo de Encuesta', { underline: true });
        doc.moveDown(0.5);

        data.respuestasPorTipo.forEach((tipo, index) => {
          doc.fontSize(12).fillColor('#2563eb').text(`${tipo.tipo}:`, { indent: 20 });
          doc.fontSize(10).fillColor('#333');
          doc.text(`  • Completadas: ${tipo.completadas}`, { indent: 30 });
          doc.text(`  • Parciales: ${tipo.parciales}`, { indent: 30 });
          doc.text(`  • Abandonadas: ${tipo.abandonadas}`, { indent: 30 });
          doc.text(`  • Total: ${tipo.total}`, { indent: 30 });
          
          if (index < data.respuestasPorTipo.length - 1) {
            doc.moveDown(0.5);
          }
        });

        // Distribución de Respuestas
        if (data.distribucionRespuestas) {
          doc.moveDown(1.5);
          doc.fontSize(14).fillColor('#000').text('Distribución de Respuestas', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10).fillColor('#333');
          doc.text(`Completadas: ${data.distribucionRespuestas.completadas}`, { indent: 20 });
          doc.text(`Parciales: ${data.distribucionRespuestas.parciales}`, { indent: 20 });
          doc.text(`Abandonadas: ${data.distribucionRespuestas.abandonadas}`, { indent: 20 });
        }

        // Distribución de Satisfacción
        if (data.distribucionSatisfaccion) {
          doc.moveDown(1.5);
          doc.fontSize(14).fillColor('#000').text('Distribución de Satisfacción', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10).fillColor('#333');
          doc.text(`Buena: ${data.distribucionSatisfaccion.buena}`, { indent: 20 });
          doc.text(`Regular: ${data.distribucionSatisfaccion.regular}`, { indent: 20 });
          doc.text(`Mala: ${data.distribucionSatisfaccion.mala}`, { indent: 20 });
        }

        // Footer
        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(8).fillColor('#999').text(
          'Sistema MAGNETO - Reporte generado automáticamente',
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(new Error(`Error generando PDF: ${error}`));
      }
    });
  }

  /**
   * Genera un archivo JSON con las métricas
   */
  static async generateJSON(data: MetricsExportData): Promise<string> {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      throw new Error(`Error generando JSON: ${error}`);
    }
  }
}
