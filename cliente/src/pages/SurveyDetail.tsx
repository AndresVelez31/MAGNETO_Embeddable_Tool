import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '@/contexts/SurveyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { surveys, deleteSurvey } = useSurvey();

  const survey = surveys.find(s => s.id === id);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteSurvey(id);
      toast.success('Encuesta eliminada correctamente');
      navigate('/admin/surveys');
    } catch (error) {
      toast.error('Error al eliminar la encuesta');
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/survey/${survey?.type}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace copiado al portapapeles');
  };

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

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Encuesta no encontrada</p>
            <Button onClick={() => navigate('/admin/surveys')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a mis encuestas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/surveys')}
            className="hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {survey.name}
              </h1>
              <Badge variant={survey.status === 'activa' ? 'default' : 'secondary'}>
                {survey.status === 'activa' ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Activa
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    {survey.status === 'borrador' ? 'Borrador' : survey.status === 'archivada' ? 'Archivada' : 'Inactiva'}
                  </>
                )}
              </Badge>
            </div>
            {survey.description && (
              <p className="text-muted-foreground">{survey.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/edit/${survey.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente la encuesta
                    "{survey.name}" y todas sus respuestas asociadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Preguntas</CardDescription>
              <CardTitle className="text-3xl">{survey.questions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tipo</CardDescription>
              <CardTitle className="text-xl">
                {survey.type === 'custom' ? 'Personalizada' : survey.type === 'application' ? 'Aplicación' : 'Abandono'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Versión</CardDescription>
              <CardTitle className="text-xl">v1.0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Metadata */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Fecha de creación:</span>
              <span className="font-medium">{formatDate(survey.createdAt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Última modificación:</span>
              <span className="font-medium">{formatDate(survey.updatedAt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-sm">{survey.id}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Enlace público:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar enlace
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Preguntas ({survey.questions.length})</CardTitle>
            <CardDescription>
              Vista previa de las preguntas de la encuesta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {survey.questions.map((question, index) => (
              <div key={question.id} className="p-4 border rounded-lg bg-secondary/10">
                <QuestionDisplay question={question} index={index} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
