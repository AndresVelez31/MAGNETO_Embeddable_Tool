import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSurvey } from '@/contexts/SurveyContext';
import type { SurveyResponse } from '@/types/survey';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionInput } from '@/components/QuestionInput';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';

export function ViewSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { surveys, addResponse } = useSurvey();

  const survey = surveys.find(s => s.id === id);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Encuesta no encontrada</CardTitle>
            <CardDescription>
              La encuesta que buscas no existe o fue eliminada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/user')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    // Validar preguntas obligatorias
    const unansweredRequired = survey.questions
      .filter(q => q.required)
      .find(q => !answers[q.id]);

    if (unansweredRequired) {
      toast.error('Por favor responde todas las preguntas obligatorias');
      return;
    }

    const response: SurveyResponse = {
      surveyId: survey.id,
      userId: user?.id || 'anonymous',
      answers,
      submittedAt: new Date().toISOString(),
    };

    addResponse(response);

    toast.success('¡Gracias por tu respuesta!', {
      description: 'Tus respuestas han sido enviadas exitosamente'
    });

    navigate('/user/thank-you');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/user')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">{survey.name}</h1>
            {survey.description && (
              <p className="text-muted-foreground mt-2">{survey.description}</p>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preguntas</CardTitle>
            <CardDescription>
              Por favor responde todas las preguntas marcadas con *
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {survey.questions.map((question, index) => (
              <QuestionInput
                key={question.id}
                question={question}
                index={index}
                value={answers[question.id]}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            ))}

            <Button onClick={handleSubmit} className="w-full" size="lg">
              <Send className="w-4 h-4 mr-2" />
              Enviar Respuestas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
