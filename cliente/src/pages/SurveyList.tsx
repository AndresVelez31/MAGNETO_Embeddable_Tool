import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Eye, Pencil, Trash2, ArrowLeft, Filter, X } from 'lucide-react';
import { useSurvey } from '@/contexts/SurveyContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function SurveyList() {
  const navigate = useNavigate();
  const { surveys, deleteSurvey } = useSurvey();
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<{ id: string; name: string } | null>(null);

  // Get unique companies
  const companies = Array.from(new Set(surveys.map(s => s.company).filter(Boolean)));

  // Filter surveys
  const filteredSurveys = surveys.filter(survey => {
    const matchesCompany = companyFilter === 'all' || survey.company === companyFilter;
    const matchesEvent = eventFilter === 'all' || survey.type === eventFilter;
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
      deleteSurvey(surveyToDelete.id);
      toast.success('Encuesta eliminada correctamente');
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
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

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Activa', variant: 'default' },
      activa: { label: 'Activa', variant: 'default' },
      inactive: { label: 'Inactiva', variant: 'secondary' },
      inactiva: { label: 'Inactiva', variant: 'secondary' },
      draft: { label: 'Borrador', variant: 'outline' },
      borrador: { label: 'Borrador', variant: 'outline' },
      archived: { label: 'Archivada', variant: 'destructive' },
      archivada: { label: 'Archivada', variant: 'destructive' }
    };
    
    const config = statusConfig[status || 'borrador'] || { label: status || 'Desconocido', variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
            <Button onClick={() => navigate('/admin/create-survey')} size="lg">
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
                    {companies.map(company => (
                      <SelectItem key={company} value={company!}>{company}</SelectItem>
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
              {filteredSurveys.map((survey) => (
                <TableRow key={survey.id} className="hover:bg-secondary/20">
                  <TableCell className="font-medium">{survey.name}</TableCell>
                  <TableCell>{getStatusBadge(survey.status)}</TableCell>
                  <TableCell>{survey.version || '1.0'}</TableCell>
                  <TableCell>
                    {survey.updatedAt 
                      ? new Date(survey.updatedAt).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(survey.type)}</Badge>
                  </TableCell>
                  <TableCell>{survey.company || 'Sin asignar'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/surveys/${survey.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/edit/${survey.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(survey.id, survey.name)}
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
