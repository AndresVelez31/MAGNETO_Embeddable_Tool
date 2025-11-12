import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { QuestionInput } from '@/shared/components/common/QuestionInput';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Survey } from '@/features/surveys/types/survey.types';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyType: 'application' | 'abandonment' | 'custom';
  jobTitle?: string;
  onNoResponse?: () => void;
}

export function SurveyModal({ isOpen, onClose, surveyType, jobTitle, onNoResponse }: SurveyModalProps) {
  const { getSurveyByType, addResponse } = useSurvey();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSurvey();
    }
  }, [isOpen, surveyType]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const foundSurvey = await getSurveyByType(surveyType);
      setSurvey(foundSurvey);
    } catch (error) {
      toast.error('Error al cargar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleClose = () => {
    if (!success && onNoResponse && survey) {
      // Registrar que el usuario cerró sin responder
      onNoResponse();
    }
    onClose();
    // Reset state
    setAnswers({});
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!survey) return;

    // Validar que todas las preguntas obligatorias estén respondidas
    const unansweredRequired = survey.questions.filter(
      q => q.required && !answers[q.id]
    );

    if (unansweredRequired.length > 0) {
      toast.error(`Por favor responde todas las preguntas obligatorias (${unansweredRequired.length} pendientes)`);
      return;
    }

    try {
      setSubmitting(true);
      await addResponse({
        surveyId: survey.id,
        answers,
        submittedAt: new Date().toISOString(),
        userId: `user-${Date.now()}`,
      });
      
      setSuccess(true);
      toast.success('¡Gracias por tu feedback!');
      
      // Cerrar automáticamente después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      toast.error('Error al enviar las respuestas');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredQuestions = survey ? Object.keys(answers).filter(key => 
    survey.questions.some(q => q.id === key)
  ).length : 0;
  
  const totalQuestions = survey?.questions.length || 0;
  const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !survey ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay encuesta disponible</p>
          </div>
        ) : success ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <DialogTitle className="text-2xl mb-2">¡Gracias por tu feedback!</DialogTitle>
            <DialogDescription>
              Tu opinión es muy valiosa para nosotros
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{jobTitle ? `Encuesta: ${jobTitle}` : survey.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {answeredQuestions}/{totalQuestions} preguntas
                </span>
              </DialogTitle>
              <DialogDescription>
                {survey.description || 'Por favor responde las siguientes preguntas'}
              </DialogDescription>
            </DialogHeader>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(progressPercent)}% completado
              </p>
            </div>

            {/* Contenido de la encuesta */}
            <div className="space-y-6 py-4">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">
                        {question.text}
                        {question.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                      <QuestionInput
                        question={question}
                        index={index}
                        value={answers[question.id] as any}
                        onChange={(value) => handleAnswerChange(question.id, value as string | string[])}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con botones */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || answeredQuestions === 0}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Respuestas'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
