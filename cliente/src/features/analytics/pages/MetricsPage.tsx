import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMetrics } from '@/features/analytics/hooks/useMetrics';
import { useExportMetrics } from '@/features/analytics/hooks/useExportMetrics';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { ArrowLeft, Users, TrendingUp, CheckCircle2, XCircle, Loader2, Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Metrics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState(30);
  const { data: metrics, isLoading, error, refetch } = useMetrics(timeRange);
  
  // Export functionality
  const { exportMetrics, isExporting } = useExportMetrics();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('json');
  const [empresa, setEmpresa] = useState('');
  const [area, setArea] = useState('');

  const handleExport = async () => {
    const result = await exportMetrics({
      formato: exportFormat,
      dias: timeRange,
      empresa: empresa || undefined,
      area: area || undefined,
    });

    if (result) {
      setExportDialogOpen(false);
      // Resetear filtros opcionales
      setEmpresa('');
      setArea('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando métricas...</span>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="hover:bg-secondary/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">Métricas y Análisis</h1>
              <p className="text-muted-foreground mt-2">No se pudieron cargar las métricas</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                {error ? 'Error al cargar los datos. Por favor, intenta de nuevo.' : 'No hay datos disponibles.'}
              </p>
              <Button onClick={() => refetch()} className="mt-4">Reintentar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Preparar datos para los gráficos con validación
  const responseData = metrics.respuestasPorTipo?.map((tipo: any) => ({
    name: tipo.tipo === 'application' ? 'Aplicación' : tipo.tipo === 'abandonment' ? 'Abandono' : 'Personalizada',
    responses: tipo.completadas + tipo.parciales + tipo.abandonadas,
    completed: tipo.completadas,
    partial: tipo.parciales,
    abandoned: tipo.abandonadas
  })) || [];

  const completionData = [
    { name: 'Completadas', value: metrics.distribucionRespuestas?.completadas || 0, color: 'hsl(var(--primary))' },
    { name: 'Parciales', value: metrics.distribucionRespuestas?.parciales || 0, color: 'hsl(var(--accent))' },
    { name: 'No respondidas', value: metrics.distribucionRespuestas?.abandonadas || 0, color: 'hsl(var(--destructive))' },
  ];

  const satisfactionData = [
    { name: 'Buena', value: metrics.distribucionSatisfaccion?.buena || 0, color: '#10b981' },
    { name: 'Regular', value: metrics.distribucionSatisfaccion?.regular || 0, color: '#f59e0b' },
    { name: 'Mala', value: metrics.distribucionSatisfaccion?.mala || 0, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Métricas y Análisis
            </h1>
            <p className="text-muted-foreground mt-2">
              Dashboard de estadísticas y rendimiento de encuestas
            </p>
          </div>
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Botón de Exportación */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Métricas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Exportar Métricas</DialogTitle>
                <DialogDescription>
                  Selecciona el formato de exportación y aplica filtros opcionales
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* Selector de Formato */}
                <div className="grid gap-2">
                  <Label htmlFor="formato">Formato de archivo</Label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger id="formato">
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileJson className="h-4 w-4" />
                          <span>JSON - Datos estructurados</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>CSV - Hoja de cálculo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>PDF - Documento</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Empresa (Opcional) */}
                <div className="grid gap-2">
                  <Label htmlFor="empresa">Empresa (opcional)</Label>
                  <Input
                    id="empresa"
                    placeholder="Ej: Magneto365"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deja vacío para incluir todas las empresas
                  </p>
                </div>

                {/* Filtro por Área (Opcional) */}
                <div className="grid gap-2">
                  <Label htmlFor="area">Área (opcional)</Label>
                  <Input
                    id="area"
                    placeholder="Ej: Recursos Humanos"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deja vacío para incluir todas las áreas
                  </p>
                </div>

                {/* Información del período */}
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Período seleccionado</p>
                  <p className="text-sm text-muted-foreground">
                    Últimos {timeRange} días
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setExportDialogOpen(false)}
                  disabled={isExporting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Exportar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Respuestas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.resumen?.totalRespuestas || 0}</div>
              <p className="text-xs text-muted-foreground">
                Últimos {timeRange} días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Completado</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.resumen?.tasaCompletado || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.resumen?.respuestasCompletas || 0} de {metrics.resumen?.totalRespuestas || 0} encuestas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encuestas Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.resumen?.encuestasActivas || 0}</div>
              <p className="text-xs text-muted-foreground">
                Disponibles para responder
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Abandono</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.resumen?.tasaAbandono || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.resumen?.respuestasAbandonadas || 0} encuestas no completadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Respuestas por Tipo de Encuesta</CardTitle>
              <CardDescription>
                Distribución de respuestas completadas, parciales y abandonadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responseData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" name="Completadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="partial" name="Parciales" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="abandoned" name="Abandonadas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado de Respuestas</CardTitle>
              <CardDescription>
                Porcentaje de completación general
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clasificación de Respuestas</CardTitle>
              <CardDescription>
                Distribución de satisfacción de candidatos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
              <CardDescription>
                Estadísticas generales del período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium">Promedio de completado</p>
                    <p className="text-2xl font-bold text-primary">1.8 min</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium">Tasa de respuesta</p>
                    <p className="text-2xl font-bold text-primary">89.3%</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium">Satisfacción general</p>
                    <p className="text-2xl font-bold text-green-600">4.2/5</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Metrics;
