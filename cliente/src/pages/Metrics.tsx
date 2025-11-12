import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encuestaService } from '@/services/encuestaService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Users, TrendingUp, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function Metrics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await encuestaService.obtenerMetricas(parseInt(timeRange));
      console.log('Métricas recibidas:', data);
      setMetrics(data);
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      toast.error('No se pudieron cargar las métricas');
      // Establecer métricas vacías para evitar el loading infinito
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando métricas...</span>
      </div>
    );
  }

  if (!metrics) {
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
              <p className="text-muted-foreground">Error al cargar los datos. Por favor, intenta de nuevo.</p>
              <Button onClick={loadMetrics} className="mt-4">Reintentar</Button>
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
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
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
