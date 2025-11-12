import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSurveyByType } from '@/features/surveys/hooks/useSurveys';
import { responseService } from '../services/response.service';
import type { Question } from '@/features/surveys/types/survey.types';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { QuestionInput } from '@/shared/components/common/QuestionInput';
import { Progress } from '@/shared/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { ROUTES } from '@/core/config/routes.config';

export function DynamicSurvey() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const surveyType = searchParams.get('type') || 'application';
  const { data: survey, isLoading } = useSurveyByType(surveyType);
  
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (survey) {
      setShowDialog(true);
    }
  }, [survey]);

  // Calculate progress
  const totalQuestions = survey?.preguntas.length || 0;
  const answeredQuestions = Object.keys(answers).filter(key => {
    const value = answers[key];
    // Considerar respondida si tiene valor
    if (Array.isArray(value)) {
      return value.length > 0; // Array con al menos un elemento
    }
    return value !== undefined && value !== '' && value !== null;
  }).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!survey) return;

    // Validar preguntas obligatorias (esObligatoria puede ser undefined, tratar como true)
    const requiredQuestions = survey.preguntas.filter((q: Question) => q.esObligatoria !== false);
    const missingAnswers = requiredQuestions.filter((q: Question) => {
      const answer = answers[q.idPregunta!];
      // Validar según el tipo de respuesta
      if (Array.isArray(answer)) {
        return answer.length === 0; // Array vacío = no respondida
      }
      return !answer || answer === ''; // undefined, null, o string vacío
    });

    if (missingAnswers.length > 0) {
      console.log('Preguntas sin responder:', missingAnswers.map(q => q.textoPregunta));
      toast.error('Por favor responde todas las preguntas obligatorias');
      // Focus first missing question
      const firstMissing = document.getElementById(`question-${missingAnswers[0].idPregunta}`);
      firstMissing?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setSubmitting(true);

      const answeredCount = Object.keys(answers).length;
      const totalQuestions = survey.preguntas.length;
      const estado = answeredCount === totalQuestions ? 'completada' : 'parcial';

      console.log('Enviando respuestas:', {
        surveyId: survey._id || survey.id,
        userId: user?.id,
        isAnonymous,
        answersCount: answeredCount,
        totalQuestions,
        estado
      });

      await responseService.submitSurveyResponse(
        survey._id || survey.id!,
        user?.id || 'anonymous',
        answers,
        isAnonymous,
        estado
      );

      console.log('✅ Respuesta enviada exitosamente');
      
      toast.success('¡Gracias por tu feedback!', {
        description: 'Tu opinión nos ayuda a mejorar'
      });
      
      console.log('🔄 Navegando a:', ROUTES.USER.THANK_YOU);
      navigate(ROUTES.USER.THANK_YOU);
    } catch (error) {
      console.error('❌ Error al enviar respuesta:', error);
      toast.error('Error al enviar la encuesta', {
        description: error instanceof Error ? error.message : 'Por favor, intenta nuevamente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    // HUF-01/02: Registrar "no respondió" al cerrar sin enviar
    if (survey && user && Object.keys(answers).length === 0) {
      try {
        await responseService.registerNoResponse(survey._id || survey.id!, user.id);
      } catch (error) {
        console.error('Error al registrar no respuesta:', error);
      }
    }
    navigate(-1);
  };

  if (isLoading) {
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
        <DialogContent className="sm:max-w-md">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-xl">{survey.nombreEncuesta}</DialogTitle>
            <DialogDescription className="pt-2">
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
              <h1 className="text-3xl font-bold text-primary">{survey.nombreEncuesta}</h1>
              {survey.empresaRelacionada && (
                <p className="text-sm text-muted-foreground mt-1">Empresa: {survey.empresaRelacionada}</p>
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
              {survey.preguntas.map((question: Question, index: number) => (
                <div key={question.idPregunta} id={`question-${question.idPregunta}`}>
                  <QuestionInput
                    question={question}
                    index={index}
                    value={answers[question.idPregunta!] as any}
                    onChange={(value) => handleAnswerChange(question.idPregunta!, value)}
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
export default DynamicSurvey;
