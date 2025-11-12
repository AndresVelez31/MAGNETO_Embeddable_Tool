import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">¡Gracias por tu respuesta!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Tu opinión nos ayuda a mejorar nuestro proceso de selección y a brindar una mejor experiencia a todos nuestros candidatos.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/user')}
            size="lg"
            className="w-full max-w-md"
          >
            Volver al Inicio
          </Button>
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            size="lg"
            className="w-full max-w-md"
          >
            Cerrar Sesión
          </Button>
        </div>
      </Card>
    </div>
  );
}
