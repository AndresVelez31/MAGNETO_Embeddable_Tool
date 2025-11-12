import type { Question } from '@/features/surveys/types/survey.types';
import { Star, Circle } from 'lucide-react';

interface QuestionDisplayProps {
  question: Question;
  index: number;
}

export function QuestionDisplay({ question, index }: QuestionDisplayProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">
        {index + 1}. {question.textoPregunta}
        {question.esObligatoria && <span className="text-destructive ml-1">*</span>}
      </h3>

      {question.tipoPregunta === 'text' && (
        <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-sm text-muted-foreground italic">Respuesta de texto libre</p>
        </div>
      )}

      {(question.tipoPregunta === 'list' || question.tipoPregunta === 'multiple') && question.opciones && (
        <div className="space-y-2">
          {question.opciones.map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-muted-foreground" />
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}

      {question.tipoPregunta === 'rating' && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-6 h-6 text-muted-foreground" />
          ))}
        </div>
      )}
    </div>
  );
}
