import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSurvey, useSurveyMutations } from '@/features/surveys/hooks/useSurveys';
import type { Question, UpdateSurveyDTO } from '@/features/surveys/types/survey.types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { QuestionDisplay } from '@/shared/components/common/QuestionDisplay';
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type QuestionType = 'text' | 'rating' | 'list' | 'multiple';

export function EditSurvey() {
  const { id } = useParams<{ id: string }>();
  const { data: survey, isLoading } = useSurvey(id!);
  const mutations = useSurveyMutations();
  const navigate = useNavigate();

  const [surveyName, setSurveyName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [surveyType, setSurveyType] = useState<'application' | 'abandonment' | 'custom'>('custom');
  const [questions, setQuestions] = useState<Question[]>([]);

  // Estado para nueva pregunta
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('text');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);

  useEffect(() => {
    if (survey) {
      setSurveyName(survey.nombreEncuesta);
      setCompanyName(survey.empresaRelacionada || '');
      setSurveyType(survey.tipoEncuesta as 'application' | 'abandonment' | 'custom');
      setQuestions(survey.preguntas || []);
    }
  }, [survey]);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      toast.error('El texto de la pregunta es obligatorio');
      return;
    }

    const newQuestion: Question = {
      idPregunta: `q-${Date.now()}`,
      textoPregunta: newQuestionText,
      tipoPregunta: newQuestionType,
      esObligatoria: newQuestionRequired,
    };

    if ((newQuestionType === 'list' || newQuestionType === 'multiple') && newQuestionOptions) {
      newQuestion.opciones = newQuestionOptions.split(',').map(opt => opt.trim()).filter(Boolean);
    }

    setQuestions([...questions, newQuestion]);
    
    // Limpiar formulario
    setNewQuestionText('');
    setNewQuestionType('text');
    setNewQuestionOptions('');
    setNewQuestionRequired(false);

    toast.success('Pregunta agregada exitosamente');
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.idPregunta !== questionId));
    toast.success('Pregunta eliminada de la encuesta');
  };

  const handleSaveSurvey = async () => {
    if (!surveyName.trim()) {
      toast.error('El nombre de la encuesta es obligatorio');
      return;
    }

    if (questions.length === 0) {
      toast.error('Debes agregar al menos una pregunta');
      return;
    }

    if (!id) return;

    try {
      const updateData: UpdateSurveyDTO = {
        nombreEncuesta: surveyName,
        empresaRelacionada: companyName || undefined,
        preguntas: questions,
      };

      await mutations.update.mutateAsync({ id, data: updateData });

      navigate('/admin/surveys');
    } catch (error) {
      console.error('Error al actualizar encuesta:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando encuesta...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/surveys')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Editar Encuesta</h1>
            <p className="text-muted-foreground mt-2">
              Modifica las preguntas y configuración de tu encuesta
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulario de Configuración */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Encuesta</CardTitle>
                <CardDescription>Información básica de la encuesta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="surveyName">Nombre de la Encuesta *</Label>
                  <Input
                    id="surveyName"
                    value={surveyName}
                    onChange={(e) => setSurveyName(e.target.value)}
                    placeholder="Ej: Encuesta de Satisfacción"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Empresa Relacionada</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej: Acme Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surveyType">Tipo de Encuesta</Label>
                  <Select value={surveyType} onValueChange={(value: any) => setSurveyType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Personalizada</SelectItem>
                      <SelectItem value="application">Aplicación</SelectItem>
                      <SelectItem value="abandonment">Abandono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agregar Pregunta</CardTitle>
                <CardDescription>Define una nueva pregunta para la encuesta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="questionText">Texto de la Pregunta *</Label>
                  <Textarea
                    id="questionText"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Escribe tu pregunta aquí"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionType">Tipo de Pregunta</Label>
                  <Select value={newQuestionType} onValueChange={(value: any) => setNewQuestionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto Libre</SelectItem>
                      <SelectItem value="list">Opción Múltiple (Una respuesta)</SelectItem>
                      <SelectItem value="multiple">Opción Múltiple (Varias respuestas)</SelectItem>
                      <SelectItem value="yesno">Sí/No</SelectItem>
                      <SelectItem value="rating">Calificación (1-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newQuestionType === 'list' || newQuestionType === 'multiple') && (
                  <div className="space-y-2">
                    <Label htmlFor="questionOptions">Opciones (separadas por comas)</Label>
                    <Textarea
                      id="questionOptions"
                      value={newQuestionOptions}
                      onChange={(e) => setNewQuestionOptions(e.target.value)}
                      placeholder="Opción 1, Opción 2, Opción 3"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="questionRequired"
                    checked={newQuestionRequired}
                    onChange={(e) => setNewQuestionRequired(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="questionRequired" className="cursor-pointer">
                    Pregunta obligatoria
                  </Label>
                </div>

                <Button onClick={handleAddQuestion} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Pregunta
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa de la Encuesta</CardTitle>
                <CardDescription>
                  {questions.length} {questions.length === 1 ? 'pregunta' : 'preguntas'} en total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {surveyName && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{surveyName}</h2>
                    {companyName && (
                      <p className="text-muted-foreground">Empresa: {companyName}</p>
                    )}
                  </div>
                )}

                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No hay preguntas agregadas aún
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((question, index) => (
                      <div key={question.idPregunta} className="relative p-4 border rounded-lg bg-muted/20">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 w-8 h-8"
                          onClick={() => handleRemoveQuestion(question.idPregunta!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <QuestionDisplay question={question} index={index} />
                      </div>
                    ))}
                  </div>
                )}

                {questions.length > 0 && (
                  <Button 
                    onClick={handleSaveSurvey} 
                    className="w-full mt-6" 
                    size="lg"
                    disabled={mutations.update.isPending}
                  >
                    {mutations.update.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EditSurvey;
