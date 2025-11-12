import type { Question } from '@/features/surveys/types/survey.types';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Star } from 'lucide-react';

interface QuestionInputProps {
  question: Question;
  index: number;
  value: string | number | string[] | undefined;
  onChange: (value: string | number | string[]) => void;
}

export function QuestionInput({ question, index, value, onChange }: QuestionInputProps) {
  const questionId = question.idPregunta || `q-${index}`;
  const questionText = question.contenido || question.textoPregunta || '';
  const isRequired = question.esObligatoria !== false; // Default to true
  
  // Obtener opciones (puede venir en dos formatos)
  const options = question.opcionesRespuesta 
    ? question.opcionesRespuesta.sort((a, b) => a.orden - b.orden)
    : question.opciones?.map((opt, i) => ({ etiqueta: opt, valor: opt, orden: i + 1 })) || [];

  return (
    <div className="space-y-3">
      <Label className="text-lg font-semibold">
        {index + 1}. {questionText}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Pregunta Abierta (Texto) - Mapeado: 'abierta' -> 'text' */}
      {question.tipoPregunta === 'text' && (
        <Textarea
          value={value as string || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tu respuesta aquí..."
          rows={4}
          className="resize-none"
        />
      )}

      {/* Opción Única (Radio) - Mapeado: 'opcion_unica' -> 'list' */}
      {question.tipoPregunta === 'list' && (
        <RadioGroup value={value as string || ''} onValueChange={onChange}>
          {options.map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <RadioGroupItem value={option.valor} id={`${questionId}-${i}`} />
              <Label htmlFor={`${questionId}-${i}`} className="font-normal cursor-pointer">
                {option.etiqueta}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {/* Opción Múltiple (Checkboxes) - Mapeado: 'opcion_multiple' -> 'multiple' */}
      {question.tipoPregunta === 'multiple' && (
        <div className="space-y-2">
          {options.map((option, i) => {
            const currentValues = (value as string[]) || [];
            const isChecked = currentValues.includes(option.valor);
            
            return (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox
                  id={`${questionId}-${i}`}
                  checked={isChecked}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      onChange([...currentValues, option.valor]);
                    } else {
                      onChange(currentValues.filter(v => v !== option.valor));
                    }
                  }}
                />
                <Label htmlFor={`${questionId}-${i}`} className="font-normal cursor-pointer">
                  {option.etiqueta}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {/* Escala/Rating - Mapeado: 'escala' -> 'rating', 'nps' -> 'rating' */}
      {question.tipoPregunta === 'rating' && (
        <>
          {options.length > 0 ? (
            // Si tiene opciones predefinidas, mostrar como radio buttons
            <RadioGroup value={value?.toString() || ''} onValueChange={onChange}>
              <div className="flex flex-wrap gap-2">
                {options.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.valor} id={`${questionId}-${i}`} />
                    <Label htmlFor={`${questionId}-${i}`} className="font-normal cursor-pointer">
                      {option.etiqueta}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            // Si no tiene opciones, mostrar estrellas (1-5)
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
        </>
      )}
    </div>
  );
}
