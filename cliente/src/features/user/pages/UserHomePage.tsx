/**
 * User Home Page
 * Página principal del portal del candidato
 * Principio: Single Responsibility - Solo maneja UI de navegación usuario
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { CheckCircle, XCircle, LogOut } from 'lucide-react';
import { ROUTES } from '@/core/config/routes.config';

function UserHomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Portal del Candidato</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Bienvenido, {user?.username}</h2>
            <p className="text-lg text-muted-foreground">
              Gracias por tu interés. Por favor, selecciona una opción:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card
              className="p-8 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary"
              onClick={() => navigate(`${ROUTES.USER.SURVEY}?type=application`)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Aplicar a Vacante</h3>
                <p className="text-muted-foreground">
                  Continuar con mi proceso de aplicación y completar la encuesta de experiencia
                </p>
              </div>
            </Card>

            <Card
              className="p-8 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-destructive/50"
              onClick={() => navigate(`${ROUTES.USER.SURVEY}?type=abandonment`)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-2xl font-semibold">Desertar del Proceso</h3>
                <p className="text-muted-foreground">
                  Cancelar mi aplicación y ayudarnos a entender los motivos
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserHomePage;
