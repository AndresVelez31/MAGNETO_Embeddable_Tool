/**
 * Hook para exportar métricas en diferentes formatos
 * Principio: Single Responsibility - Solo maneja la exportación de métricas
 */

import { useState } from 'react';
import { analyticsService } from '../services/analytics.service';
import { useToast } from '@/shared/hooks/use-toast';

export interface ExportFilters {
  formato: 'csv' | 'pdf' | 'json';
  dias?: number;
  empresa?: string;
  area?: string;
}

export function useExportMetrics() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportMetrics = async (filters: ExportFilters) => {
    setIsExporting(true);
    
    try {
      console.log('🚀 Iniciando exportación con filtros:', filters);
      
      // Llamar al servicio para exportar
      const blob = await analyticsService.exportMetrics(filters);
      
      console.log('✅ Blob recibido:', blob.size, 'bytes, tipo:', blob.type);
      
      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob);
      console.log('🔗 URL del blob creada:', url);
      
      // Crear elemento <a> temporal para descargar
      const link = document.createElement('a');
      link.href = url;
      
      // Determinar nombre y extensión del archivo
      const timestamp = new Date().getTime();
      const extension = filters.formato;
      link.download = `metricas_${timestamp}.${extension}`;
      
      console.log('📥 Descargando archivo:', link.download);
      
      // Simular click para descargar
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('🧹 Limpieza completada');
      }, 100);
      
      // Mostrar mensaje de éxito
      toast({
        title: "Exportación completada",
        description: `Las métricas se han exportado correctamente en formato ${filters.formato.toUpperCase()}.`,
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error al exportar métricas:', error);
      
      toast({
        title: "Error al exportar",
        description: error instanceof Error ? error.message : "No se pudo completar la exportación. Intenta nuevamente.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportMetrics,
    isExporting
  };
}
