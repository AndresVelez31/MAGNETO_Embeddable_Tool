import type { Question } from '@/types/survey';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star } from 'lucide-react';

interface QuestionInputProps {
  question: Question;
  index: number;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}

export function QuestionInput({ question, index, value, onChange }: QuestionInputProps) {
  return (
    <div className="space-y-3">
      <Label className="text-lg font-semibold">
        {index + 1}. {question.text}
        {question.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {question.type === 'text' && (
        <Textarea
          value={value as string || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tu respuesta aquí..."
          rows={4}
        />
      )}

      {question.type === 'list' && question.options && (
        <RadioGroup value={value as string || ''} onValueChange={onChange}>
          {question.options.map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${question.id}-${i}`} />
              <Label htmlFor={`${question.id}-${i}`} className="font-normal cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === 'yesno' && (
        <RadioGroup value={value as string || ''} onValueChange={onChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id={`${question.id}-yes`} />
            <Label htmlFor={`${question.id}-yes`} className="font-normal cursor-pointer">
              Sí
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id={`${question.id}-no`} />
            <Label htmlFor={`${question.id}-no`} className="font-normal cursor-pointer">
              No
            </Label>
          </div>
        </RadioGroup>
      )}

      {question.type === 'rating' && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (value as number || 0)
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
