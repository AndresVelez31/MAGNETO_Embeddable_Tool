import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { UserCircle, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Login() {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerAttempts, setRegisterAttempts] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mock registered users (in real app, this would be in a database)
  const [registeredUsers] = useState([
    { email: 'admin@magneto.com', password: 'admin123', role: 'admin', name: 'Administrador' },
    { email: 'usuario@test.com', password: 'usuario123', role: 'user', name: 'Usuario' }
  ]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked
    if (lockedUntil && new Date() < lockedUntil) {
      const minutesLeft = Math.ceil((lockedUntil.getTime() - new Date().getTime()) / 60000);
      toast.error(`Demasiados intentos. Espere ${minutesLeft} minuto(s) o contacte al soporte`);
      return;
    }

    // Validate empty fields
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Complete todos los campos obligatorios');
      // Highlight empty fields
      if (!loginEmail.trim()) {
        document.getElementById('login-email')?.classList.add('border-destructive');
      }
      if (!loginPassword.trim()) {
        document.getElementById('login-password')?.classList.add('border-destructive');
      }
      return;
    }

    // Remove error styling
    document.getElementById('login-email')?.classList.remove('border-destructive');
    document.getElementById('login-password')?.classList.remove('border-destructive');

    // Validate email format
    if (!validateEmail(loginEmail)) {
      toast.error('Ingrese un correo válido (ej: nombre@dominio.com)');
      return;
    }

    // Check credentials against mock database
    const user = registeredUsers.find(u => u.email === loginEmail && u.password === loginPassword);
    
    if (user) {
      // Use mock credentials that match AuthContext
      const mockUsername = user.role === 'admin' ? 'admin' : 'user';
      const mockPassword = user.role === 'admin' ? 'admin123' : 'user123';
      
      const loggedInUser = login(mockUsername, mockPassword);
      if (loggedInUser) {
        toast.success('Inicio de sesión exitoso');
        setLoginAttempts(0);
        setLockedUntil(null);
        
        // Navigate based on role
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      }
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        const lockTime = new Date();
        lockTime.setMinutes(lockTime.getMinutes() + 5);
        setLockedUntil(lockTime);
        toast.error('Demasiados intentos. Espere 5 minutos o contacte al soporte');
      } else {
        toast.error('Correo o contraseña inválidos. ¿Olvidó su contraseña?', {
          description: `Intento ${newAttempts} de 3`
        });
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate empty fields
    if (!registerEmail.trim() || !registerPassword.trim() || !registerName.trim()) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    // Validate email format
    if (!validateEmail(registerEmail)) {
      toast.error('Ingrese un correo válido (ej: nombre@dominio.com)');
      document.getElementById('register-email')?.focus();
      return;
    }

    // Check if email already exists
    const emailExists = registeredUsers.some(u => u.email === registerEmail);
    if (emailExists) {
      const newAttempts = registerAttempts + 1;
      setRegisterAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        toast.error('Demasiados intentos. Espere 5 minutos o contacte al soporte');
      } else {
        toast.error('Correo ya existente', {
          description: 'Este correo ya está registrado en el sistema'
        });
      }
      return;
    }

    // Validate password length
    if (registerPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      document.getElementById('register-password')?.focus();
      return;
    }

    // Mock successful registration
    toast.success('Cuenta creada exitosamente', {
      description: 'Ya puedes iniciar sesión con tus credenciales'
    });
    
    // Switch to login tab
    const loginTab = document.querySelector('[data-value="login"]') as HTMLButtonElement;
    loginTab?.click();
    
    // Pre-fill login email
    setLoginEmail(registerEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <UserCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenido</h1>
          <p className="text-muted-foreground">Plataforma de Encuestas y Feedback</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" data-value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      e.target.classList.remove('border-destructive');
                    }}
                    className="pl-10"
                    placeholder="nombre@dominio.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      e.target.classList.remove('border-destructive');
                    }}
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={!!(lockedUntil && new Date() < lockedUntil)}
              >
                Ingresar
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p className="mb-2">Cuentas de prueba:</p>
              <p><strong>Admin:</strong> admin@magneto.com / admin123</p>
              <p><strong>Usuario:</strong> usuario@test.com / usuario123</p>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre Completo</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="pl-10"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="pl-10"
                    placeholder="nombre@dominio.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  La contraseña debe tener al menos 8 caracteres
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
              >
                Crear Cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
