
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  const { profile, logout } = useAuth();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-red-50 p-4 rounded-full mb-6">
        <ShieldX className="h-16 w-16 text-red-600" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-gray-900 font-heading mb-2">
        Acesso não autorizado
      </h1>
      
      <p className="text-center text-lg text-gray-600 mb-8 max-w-md">
        Você não tem permissão para acessar esta página. 
        {profile ? ` Seu perfil atual é: ${profile.role}.` : ''}
      </p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Link to="/">
          <Button>
            Voltar para a página inicial
          </Button>
        </Link>
        
        <Link to="/dashboard">
          <Button variant="outline">
            Ir para o dashboard
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          onClick={async () => {
            await logout();
            window.location.href = '/login';
          }}
        >
          Sair e entrar com outra conta
        </Button>
      </div>
    </div>
  );
}
