import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Eye, ArrowLeft, Filter, X, FileText } from 'lucide-react';
import { useResponses } from '@/features/responses/hooks/useResponses';
import { useSurveys } from '@/features/surveys/hooks/useSurveys';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';

function ResponseListPage() {
  const navigate = useNavigate();
  const { data: responses = [], isLoading, error } = useResponses();
  const { data: surveys = [] } = useSurveys();
  
  const [surveyFilter, setSurveyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Debug: ver qué estamos recibiendo
  console.log('📊 Respuestas recibidas:', { responses, count: responses.length });

  // Obtener lista única de usuarios
  const users = Array.from(
    new Set(
      responses
        .map((r: any) => {
          // Manejar idUsuario que podría ser un objeto o string
          const userId = typeof r.idUsuario === 'object' ? r.idUsuario?._id || r.idUsuario?.id : r.idUsuario;
          return userId as string;
        })
        .filter((userId: string) => Boolean(userId) && userId !== 'anonymous')
    )
  ).sort() as string[];

  // Filtrar respuestas
  const filteredResponses = responses.filter((response: any) => {
    // Obtener el ID de la encuesta (puede ser string u objeto populated)
    const encuestaId = typeof response.idEncuesta === 'object' 
      ? (response.idEncuesta._id || response.idEncuesta.id)
      : response.idEncuesta;
    
    // Obtener el ID del usuario (puede ser string u objeto populated)
    const userId = typeof response.idUsuario === 'object'
      ? (response.idUsuario._id || response.idUsuario.id)
      : response.idUsuario;
    
    const matchesSurvey = surveyFilter === 'all' || encuestaId === surveyFilter;
    const matchesStatus = statusFilter === 'all' || response.estado === statusFilter;
    const matchesUser = userFilter === 'all' || 
                        (userFilter === 'anonymous' && userId === 'anonymous') ||
                        userId === userFilter;
    
    return matchesSurvey && matchesStatus && matchesUser;
  });

  const hasActiveFilters = surveyFilter !== 'all' || statusFilter !== 'all' || userFilter !== 'all';

  const clearFilters = () => {
    setSurveyFilter('all');
    setStatusFilter('all');
    setUserFilter('all');
  };

  const getSurveyName = (surveyIdOrObject: string | any) => {
    // Si es un objeto (populate), obtener el nombre directamente
    if (typeof surveyIdOrObject === 'object' && surveyIdOrObject?.nombreEncuesta) {
      return surveyIdOrObject.nombreEncuesta;
    }
    // Si es string, buscar en la lista de encuestas
    const surveyId = typeof surveyIdOrObject === 'string' ? surveyIdOrObject : surveyIdOrObject?._id || surveyIdOrObject?.id;
    const survey = surveys.find((s: any) => (s._id || s.id) === surveyId);
    return survey?.nombreEncuesta || 'Encuesta no encontrada';
  };

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      completada: { variant: 'default', label: 'Completada' },
      parcial: { variant: 'secondary', label: 'Parcial' },
      no_respondida: { variant: 'destructive', label: 'No respondida' },
    };
    const config = variants[estado] || { variant: 'outline' as const, label: estado };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando respuestas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center text-destructive mb-4">
            <p className="font-semibold">Error al cargar respuestas</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full">
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Gestión de Respuestas</h1>
              <p className="text-muted-foreground mt-1">
                Visualiza las respuestas enviadas por los usuarios
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total respuestas</p>
                <p className="text-2xl font-bold">{filteredResponses.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Filtros:</span>
            </div>
            
            <div className="flex-1 flex items-center gap-4 flex-wrap">
              <div className="min-w-[200px]">
                <Select value={surveyFilter} onValueChange={setSurveyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Encuesta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las encuestas</SelectItem>
                    {surveys.map((survey: any) => (
                      <SelectItem key={survey._id || survey.id} value={survey._id || survey.id}>
                        {survey.nombreEncuesta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="no_respondida">No respondida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[180px]">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="anonymous">Anónimos</SelectItem>
                    {users.map((userId) => (
                      <SelectItem key={userId} value={userId}>
                        {userId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Tabla de respuestas */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Encuesta</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Respuestas</TableHead>
                <TableHead>Fecha de Envío</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.map((response: any) => (
                <TableRow key={response._id || response.id} className="hover:bg-secondary/20">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {getSurveyName(response.idEncuesta)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const userId = typeof response.idUsuario === 'object' 
                          ? (response.idUsuario._id || response.idUsuario.id)
                          : response.idUsuario;
                        
                        return userId === 'anonymous' ? (
                          <Badge variant="outline">Anónimo</Badge>
                        ) : (
                          <span className="font-mono text-sm">{userId}</span>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(response.estado || 'completada')}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {response.respuestasItem?.length || 0} respuestas
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDate(response.fechaEnvio || response.creadaEn)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/responses/${response._id || response.id}`)}
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredResponses.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {responses.length === 0 
                ? 'No hay respuestas registradas aún'
                : 'No se encontraron respuestas con los filtros seleccionados'
              }
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

export default ResponseListPage;
