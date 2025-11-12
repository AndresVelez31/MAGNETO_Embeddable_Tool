import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Plus, Eye, Pencil, Trash2, ArrowLeft, Filter, X } from 'lucide-react';
import { useSurveys, useSurveyMutations } from '@/features/surveys/hooks/useSurveys';
import { toast } from 'sonner';
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
} from '@/shared/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';

function SurveyListPage() {
  const navigate = useNavigate();
  const { data: surveys = [] } = useSurveys();
  const mutations = useSurveyMutations();
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<{ id: string; name: string } | null>(null);

  // Get unique companies - solo las que existen
  const companies = Array.from(
    new Set(
      surveys
        .map((s: any) => s.empresaRelacionada)
        .filter((empresa): empresa is string => Boolean(empresa) && empresa.trim() !== '')
    )
  ).sort();

  // Filter surveys - lógica mejorada
  const filteredSurveys = surveys.filter((survey: any) => {
    const surveyCompany = survey.empresaRelacionada || '';
    const surveyType = survey.tipoEncuesta || '';
    
    const matchesCompany = companyFilter === 'all' || 
                          (companyFilter === 'sin-asignar' && !surveyCompany) ||
                          surveyCompany === companyFilter;
    
    const matchesEvent = eventFilter === 'all' || surveyType === eventFilter;
    
    return matchesCompany && matchesEvent;
  });

  const hasActiveFilters = companyFilter !== 'all' || eventFilter !== 'all';

  const clearFilters = () => {
    setCompanyFilter('all');
    setEventFilter('all');
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSurveyToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (surveyToDelete) {
      mutations.delete.mutate(surveyToDelete.id);
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
    }
  };

  const handleStatusChange = async (surveyId: string, newStatus: string) => {
    try {
      await mutations.updateStatus.mutateAsync({ id: surveyId, status: newStatus });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      application: 'Postulación',
      abandonment: 'Deserción',
      custom: 'Personalizada'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Gestión de Encuestas</h1>
            <Button onClick={() => navigate('/admin/surveys/create')} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Crear Encuesta
            </Button>
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
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las empresas</SelectItem>
                    <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[200px]">
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los eventos</SelectItem>
                    <SelectItem value="application">Postulación</SelectItem>
                    <SelectItem value="abandonment">Deserción</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
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

        {/* Tabla de encuestas */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead>Última Modificación</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.map((survey: any) => (
                <TableRow key={survey._id || survey.id} className="hover:bg-secondary/20">
                  <TableCell className="font-medium">{survey.nombreEncuesta}</TableCell>
                  <TableCell>
                    <Select 
                      value={survey.estado} 
                      onValueChange={(newStatus) => handleStatusChange(survey._id || survey.id, newStatus)}
                      disabled={mutations.updateStatus.isPending}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="borrador">Borrador</SelectItem>
                        <SelectItem value="activa">Activa</SelectItem>
                        <SelectItem value="inactiva">Inactiva</SelectItem>
                        <SelectItem value="archivada">Archivada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>1.0</TableCell>
                  <TableCell>
                    {survey.ultimaModificacion 
                      ? new Date(survey.ultimaModificacion).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(survey.tipoEncuesta)}</Badge>
                  </TableCell>
                  <TableCell>{survey.empresaRelacionada || 'Sin asignar'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/surveys/${survey._id || survey.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/surveys/${survey._id || survey.id}/edit`)}
                        title="Editar encuesta"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(survey._id || survey.id || '', survey.nombreEncuesta)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSurveys.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron encuestas con los filtros seleccionados
            </div>
          )}
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar '{surveyToDelete?.name}'? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default SurveyListPage
