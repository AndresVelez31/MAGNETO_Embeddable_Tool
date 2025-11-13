import { useParams, useNavigate } from 'react-router-dom';
import { useResponse } from '@/features/responses/hooks/useResponses';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, User, Calendar, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export function ResponseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading: loadingResponse } = useResponse(id!);
  
  // Si idEncuesta es un objeto (populated), usarlo directamente, sino es string
  const survey = response?.idEncuesta && typeof response.idEncuesta === 'object' 
    ? response.idEncuesta 
    : null;
  
  const loadingSurvey = false; // Ya tenemos el survey del populate

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getQuestionText = (questionId: string) => {
    if (!survey) return questionId;
    const question = survey.preguntas.find((q: any) => q.idPregunta === questionId);
    return question?.contenido || question?.textoPregunta || questionId;
  };

  const formatAnswer = (answer: string | number | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return String(answer);
  };

  if (loadingResponse || loadingSurvey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <span className="text-muted-foreground">Cargando respuesta...</span>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Respuesta no encontrada</p>
            <Button onClick={() => navigate('/admin/responses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a respuestas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/responses')}
            className="hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-primary">
                Detalle de Respuesta
              </h1>
              {getStatusBadge(response.estado || 'completada')}
            </div>
            {survey && (
              <p className="text-muted-foreground">
                Encuesta: {survey.nombreEncuesta}
              </p>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <CardDescription>Usuario</CardDescription>
              </div>
              <CardTitle className="text-xl">
                {(() => {
                  const userId = typeof response.idUsuario === 'object'
                    ? (response.idUsuario._id || response.idUsuario.id)
                    : response.idUsuario;
                  
                  return userId === 'anonymous' ? (
                    <Badge variant="outline">Anónimo</Badge>
                  ) : (
                    <span className="font-mono text-base">{userId}</span>
                  );
                })()}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <CardDescription>Respuestas</CardDescription>
              </div>
              <CardTitle className="text-3xl">
                {response.respuestasItem?.length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <CardDescription>Fecha de Envío</CardDescription>
              </div>
              <CardTitle className="text-sm">
                {formatDate(response.fechaEnvio || response.creadaEn)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Metadata */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">ID de Respuesta:</span>
              <span className="font-mono text-sm">{response._id || response.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">ID de Encuesta:</span>
              <span className="font-mono text-sm">
                {typeof response.idEncuesta === 'object' 
                  ? (response.idEncuesta._id || response.idEncuesta.id)
                  : response.idEncuesta
                }
              </span>
            </div>
            {survey && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Nombre de Encuesta:</span>
                <span className="font-medium">{survey.nombreEncuesta}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Estado:</span>
              {getStatusBadge(response.estado || 'completada')}
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Anónima:</span>
              <span className="font-medium">{response.anonimo ? 'Sí' : 'No'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Respuestas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <CardTitle>Respuestas ({response.respuestasItem?.length || 0})</CardTitle>
            </div>
            <CardDescription>
              Detalle de las respuestas proporcionadas por el usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {response.respuestasItem && response.respuestasItem.length > 0 ? (
              response.respuestasItem.map((item: any, index: number) => (
                <div key={item.idPregunta || index} className="p-4 border rounded-lg bg-secondary/10">
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-2">
                      Pregunta {index + 1}
                    </span>
                    <p className="font-medium text-foreground">
                      {getQuestionText(item.idPregunta)}
                    </p>
                  </div>
                  <div className="pl-4 border-l-2 border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Respuesta:</p>
                    <p className="text-base font-medium">
                      {formatAnswer(item.respuesta)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay respuestas registradas
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ResponseDetailPage;
