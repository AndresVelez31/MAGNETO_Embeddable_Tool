import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSurveyByType } from '@/features/surveys/hooks/useSurveys';
import { useSubmitResponse, useRegisterNoResponse } from '../hooks/useResponses';
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/core/config/routes.config';

export function DynamicSurvey() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Hooks para mutations
  const submitResponseMutation = useSubmitResponse();
  const registerNoResponseMutation = useRegisterNoResponse();

  const surveyType = searchParams.get('type') || 'postulacion';
  const jobTitle = searchParams.get('jobTitle') || searchParams.get('vacancyName') || '';
  const embedded = searchParams.get('embedded') === 'true';
  
  const { data: survey, isLoading } = useSurveyByType(surveyType);
  
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (survey && !embedded) {
      setShowWelcomeDialog(true);
    }
  }, [survey, embedded]);

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

      await submitResponseMutation.mutateAsync({
        surveyId: survey._id || survey.id!,
        userId: user?.id || 'anonymous',
        answers,
        isAnonymous,
        estado
      });

      console.log('✅ Respuesta enviada exitosamente');
      
      // HUF-04: Mostrar pop-up de éxito
      setShowSuccessDialog(true);
      
      // Notificar al padre si está embebido
      if (embedded && window.parent) {
        window.parent.postMessage({ type: 'survey_completed', data: { surveyId: survey._id || survey.id } }, '*');
      }
    } catch (error) {
      console.error('❌ Error al enviar respuesta:', error);
      
      // HUF-04: Mostrar pop-up de error
      const errorMsg = error instanceof Error ? error.message : 'Error al enviar la encuesta. Por favor, intenta nuevamente.';
      setErrorMessage(errorMsg);
      setShowErrorDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    // HUF-01/02: Registrar "no respondió" al cerrar sin enviar
    if (survey && user && Object.keys(answers).length === 0) {
      try {
        await registerNoResponseMutation.mutateAsync({
          surveyId: survey._id || survey.id!,
          userId: user.id
        });
        console.log('📝 Registrado "no respondió" para usuario:', user.id);
      } catch (error) {
        console.error('Error al registrar no respuesta:', error);
      }
    }
    
    // Notificar al padre si está embebido
    if (embedded && window.parent) {
      window.parent.postMessage({ type: 'survey_closed' }, '*');
    }
    
    navigate(-1);
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    
    // En modo embebido, solo cerrar el modal
    if (embedded && window.parent) {
      window.parent.postMessage({ type: 'survey_closed' }, '*');
      return;
    }
    
    // En modo normal, volver al home o cerrar
    navigate(ROUTES.USER.HOME);
  };

  const handleErrorClose = () => {
    setShowErrorDialog(false);
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
      <Dialog open={showWelcomeDialog} onOpenChange={(open) => {
        if (!open) handleClose();
        setShowWelcomeDialog(open);
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
              {/* HUF-01/02: Mostrar contexto según el tipo de encuesta */}
              {surveyType === 'postulacion' || surveyType === 'application' ? (
                <>Tu opinión sobre el proceso de aplicación es muy importante para nosotros. Esta encuesta te tomará aproximadamente 2 minutos.</>
              ) : surveyType === 'desercion' || surveyType === 'abandonment' ? (
                <>Lamentamos que hayas decidido abandonar el proceso. Tu feedback nos ayudará a mejorar. Esta encuesta te tomará aproximadamente 2 minutos.</>
              ) : (
                <>Tu opinión es muy importante para nosotros. Esta encuesta te tomará aproximadamente 2 minutos.</>
              )}
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
            <Button onClick={() => setShowWelcomeDialog(false)} className="flex-1">
              Comenzar Encuesta
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog - HUF-04 */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold">
              ¡Encuesta completada!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base pt-2 space-y-3">
              <p className="text-foreground font-medium">
                Gracias por compartir tu opinión con nosotros.
              </p>
              <p className="text-muted-foreground">
                Tu feedback nos ayuda a mejorar nuestro proceso de selección y a brindar una mejor experiencia a todos nuestros candidatos.
              </p>
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Tus respuestas han sido guardadas de forma segura
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button onClick={handleSuccessClose} className="w-full" size="lg">
              {embedded ? 'Cerrar' : 'Volver al Inicio'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog - HUF-04 */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold">
              Error al enviar
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base pt-2 space-y-3">
              <p className="text-foreground font-medium">
                No se pudo completar el envío de la encuesta.
              </p>
              <p className="text-muted-foreground">
                {errorMessage || 'Por favor, verifica tu conexión a internet e intenta nuevamente.'}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 mt-6">
            <Button variant="outline" onClick={handleErrorClose} className="flex-1" size="lg">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1" size="lg">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Reintentar'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={handleClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-primary">{survey.nombreEncuesta}</h1>
              {/* HUF-01: Mostrar nombre de vacante en el encabezado */}
              {jobTitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold">Vacante:</span> {jobTitle}
                </p>
              )}
              {survey.empresaRelacionada && (
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold">Empresa:</span> {survey.empresaRelacionada}
                </p>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Progress Indicator - HUF-03 */}
          <Card className="p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Progreso de la encuesta</span>
                <span className="text-2xl font-bold text-primary">
                  {answeredQuestions} / {totalQuestions}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {progressPercentage === 100 
                  ? '¡Excelente! Has completado todas las preguntas' 
                  : `${answeredQuestions} de ${totalQuestions} preguntas respondidas (${Math.round(progressPercentage)}%)`
                }
              </p>
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
