import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSurvey } from '@/contexts/SurveyContext';
import type { Survey, SurveyResponse } from '@/types/survey';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuestionInput } from '@/components/QuestionInput';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function DynamicSurvey() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addResponse, getSurveyByType } = useSurvey();

  const surveyType = searchParams.get('type') || 'application';
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    loadSurvey();
  }, [surveyType]);

  useEffect(() => {
    if (survey) {
      setShowDialog(true);
    }
  }, [survey]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const surveyData = await getSurveyByType(surveyType);
      if (surveyData) {
        setSurvey(surveyData);
      } else {
        toast.error(`No se encontró una encuesta activa de tipo: ${surveyType}`);
        navigate(-1);
      }
    } catch (error) {
      console.error('Error al cargar encuesta:', error);
      toast.error('Error al cargar la encuesta');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress
  const totalQuestions = survey?.questions.length || 0;
  const answeredQuestions = Object.keys(answers).filter(key => {
    const value = answers[key];
    return value !== undefined && value !== '' && value !== null;
  }).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!survey) return;

    const requiredQuestions = survey.questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id]);

    if (missingAnswers.length > 0) {
      toast.error('Por favor responde todas las preguntas obligatorias');
      // Focus first missing question
      const firstMissing = document.getElementById(`question-${missingAnswers[0].id}`);
      firstMissing?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setSubmitting(true);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (user) {
        const response: SurveyResponse = {
          surveyId: survey.id,
          userId: isAnonymous ? 'anonymous' : user.id,
          answers,
          submittedAt: new Date().toISOString()
        };

        await addResponse(response);
      }

      toast.success('¡Gracias por tu feedback!', {
        description: 'Tu opinión nos ayuda a mejorar'
      });
      navigate(`/survey/${survey.id}/thank-you`);
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
      toast.error('Error al enviar la encuesta. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Cargando encuesta...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-destructive mb-4">Encuesta no encontrada</h2>
          <Button onClick={() => navigate(-1)}>Volver</Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) handleClose();
        setShowDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{survey.name}</DialogTitle>
            <DialogDescription>
              Tu opinión es muy importante para nosotros. Esta encuesta te tomará aproximadamente 2 minutos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                No compartir mi identidad (responder de forma anónima)
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowDialog(false)} className="flex-1">
              Comenzar Encuesta
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={handleClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-primary">{survey.name}</h1>
              {survey.description && (
                <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Progress Indicator */}
          <Card className="p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progreso de la encuesta</span>
                <span className="text-muted-foreground">
                  {answeredQuestions} / {totalQuestions} preguntas respondidas
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </Card>

          <Card className="p-8">
            <div className="space-y-8">
              {survey.questions.map((question, index) => (
                <div key={question.id} id={`question-${question.id}`}>
                  <QuestionInput
                    question={question}
                    index={index}
                    value={answers[question.id] as any}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Button 
                onClick={handleSubmit} 
                size="lg" 
                className="flex-1 bg-accent hover:bg-accent/90"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Encuesta'
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </>
  );
}
