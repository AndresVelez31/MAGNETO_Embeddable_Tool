import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey, useSurveyMutations } from '@/features/surveys/hooks/useSurveys';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { QuestionDisplay } from '@/shared/components/common/QuestionDisplay';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
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
} from '@/shared/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: survey, isLoading } = useSurvey(id!);
  const mutations = useSurveyMutations();

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await mutations.delete.mutateAsync(id);
      navigate('/admin/surveys');
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      await mutations.updateStatus.mutateAsync({ id, status: newStatus });
      toast.success('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/survey?type=${survey?.tipoEncuesta}`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando encuesta...</span>
      </div>
    );
  }

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
                {survey.nombreEncuesta}
              </h1>
              <Badge variant={survey.estado === 'activa' ? 'default' : 'secondary'}>
                {survey.estado === 'activa' ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Activa
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    {survey.estado === 'borrador' ? 'Borrador' : survey.estado === 'archivada' ? 'Archivada' : 'Inactiva'}
                  </>
                )}
              </Badge>
            </div>
            {survey.empresaRelacionada && (
              <p className="text-muted-foreground">Empresa: {survey.empresaRelacionada}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/surveys/${id}/edit`)}
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
                    "{survey.nombreEncuesta}" y todas sus respuestas asociadas.
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

        {/* Estado de la Encuesta */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Estado de la Encuesta</CardTitle>
            <CardDescription>
              Cambia el estado para activar o desactivar la encuesta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select 
                  value={survey.estado} 
                  onValueChange={handleStatusChange}
                  disabled={mutations.updateStatus.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Borrador</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="activa">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Activa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="inactiva">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>Inactiva</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="archivada">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Archivada</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {survey.estado === 'activa' && '✓ Los usuarios pueden responder esta encuesta'}
                {survey.estado === 'borrador' && 'Esta encuesta aún no está disponible para usuarios'}
                {survey.estado === 'inactiva' && 'Esta encuesta está temporalmente desactivada'}
                {survey.estado === 'archivada' && 'Esta encuesta está archivada'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Preguntas</CardDescription>
              <CardTitle className="text-3xl">{survey.preguntas.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tipo</CardDescription>
              <CardTitle className="text-xl">
                {survey.tipoEncuesta === 'custom' ? 'Personalizada' : survey.tipoEncuesta === 'application' ? 'Aplicación' : 'Abandono'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Empresa</CardDescription>
              <CardTitle className="text-xl">{survey.empresaRelacionada || 'Sin asignar'}</CardTitle>
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
              <span className="font-medium">{formatDate(survey.creadaEn)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Última modificación:</span>
              <span className="font-medium">{formatDate(survey.ultimaModificacion)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-sm">{survey._id || survey.id}</span>
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
            <CardTitle>Preguntas ({survey.preguntas.length})</CardTitle>
            <CardDescription>
              Vista previa de las preguntas de la encuesta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {survey.preguntas.map((question, index) => (
              <div key={question.idPregunta || `q-${index}`} className="p-4 border rounded-lg bg-secondary/10">
                <QuestionDisplay question={question} index={index} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default SurveyDetail;
