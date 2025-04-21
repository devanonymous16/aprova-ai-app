
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Verifique se há um tipo de login especificado (B2B vs B2C)
  const loginType = searchParams.get('type') || 'b2c';
  
  // Sugestão de email baseado no tipo de login (para facilitar testes da demo)
  const emailPlaceholder = loginType === 'b2b' 
    ? 'aluno.b2b@exemplo.com'
    : 'aluno@exemplo.com';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando para o dashboard...",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Preencher automaticamente emails para demo (remover em produção)
  const fillDemoCredentials = (type: string) => {
    switch (type) {
      case 'admin':
        setEmail('admin@forefy.com');
        break;
      case 'manager':
        setEmail('manager@forefy.com');
        break;
      case 'student':
        setEmail('student@forefy.com');
        break;
      case 'b2b':
        setEmail('student.b2b@forefy.com');
        break;
    }
    setPassword('password123');
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-gradient font-heading">
          Forefy
        </h1>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900 font-heading">
          {loginType === 'b2b' ? 'Acesso para alunos de cursinhos' : 'Entre em sua conta'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {loginType === 'b2b' 
            ? 'Use as credenciais fornecidas pelo seu cursinho' 
            : 'Não tem uma conta?'
          }
          {' '}
          {loginType === 'b2b' 
            ? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sou aluno individual</Link>
            : <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">Cadastre-se agora</Link>
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Senha
                </Label>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-primary-900 hover:bg-primary-800"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </div>
          </form>
          
          {/* DEMO: Seção de login rápido para teste (remover em produção) */}
          <div className="mt-8 border-t pt-6">
            <p className="mb-4 text-sm text-gray-500 text-center">Demo: Acesso rápido por perfil</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('admin')}
                className="text-xs"
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('manager')}
                className="text-xs"
              >
                Gerente
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('student')}
                className="text-xs"
              >
                Estudante
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('b2b')}
                className="text-xs"
              >
                Estudante B2B
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
