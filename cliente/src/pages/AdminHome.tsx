import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClipboardList, BarChart3, LogOut } from 'lucide-react';

export function AdminHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Hola, {user?.username}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Qué deseas hacer hoy?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card
              className="p-8 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary"
              onClick={() => navigate('/admin/surveys')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Gestión de Encuestas</h3>
                <p className="text-muted-foreground">
                  Crea, edita y administra encuestas para tus candidatos
                </p>
              </div>
            </Card>

            <Card
              className="p-8 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-accent"
              onClick={() => navigate('/admin/metrics')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">Visualización de Métricas</h3>
                <p className="text-muted-foreground">
                  Revisa estadísticas y resultados de las encuestas
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
