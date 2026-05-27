import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      if (!error.response) {
        toast.error('Nao foi possivel conectar ao servidor. Verifique se o backend esta em execucao.');
      } else {
        toast.error(error.response?.data?.detail || 'Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-primary">NexusMeet</h1>
            <p className="text-slate-600">Sistema de Agendamento de Salas de Reunião</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email-input"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                data-testid="login-password-input"
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'Entrando...' : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              <strong>Usuário padrão:</strong> admin@sistema.com | <strong>Senha:</strong> admin123
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1749310726959-d8fccfef7ee4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY29ycG9yYXRlJTIwb2ZmaWNlJTIwbG9iYnl8ZW58MHx8fHwxNzcyNTM5MTE1fDA&ixlib=rb-4.1.0&q=85')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-bold">Gerencie suas salas de reunião de forma inteligente</h2>
            <p className="text-lg text-white/90">
              Reserve salas, visualize disponibilidade em tempo real e receba notificações automáticas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;