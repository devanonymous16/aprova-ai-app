
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  const { profile, logout, user, session, hasRole } = useAuth();
  
  // Função auxiliar para exibir as informações do usuário para depuração
  const renderDebugInfo = () => {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left text-sm max-w-xl mx-auto">
        <h3 className="font-semibold mb-2">Informações de depuração:</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Autenticado:</span> {user ? 'Sim' : 'Não'}</p>
          <p><span className="font-medium">E-mail:</span> {user?.email || 'N/A'}</p>
          <p><span className="font-medium">ID de usuário:</span> {user?.id || 'N/A'}</p>
          <p><span className="font-medium">Perfil carregado:</span> {profile ? 'Sim' : 'Não'}</p>
          {profile && (
            <>
              <p><span className="font-medium">Nome:</span> {profile.name}</p>
              <p><span className="font-medium">Role:</span> {profile.role}</p>
              <p><span className="font-medium">Admin:</span> {hasRole('admin') ? 'Sim' : 'Não'}</p>
            </>
          )}
        </div>
      </div>
    );
  };
  
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
        {profile ? ` Seu perfil atual é: ${profile.role}.` : ' Seu perfil não foi carregado corretamente.'}
      </p>
      
      {renderDebugInfo()}
      
      <div className="flex flex-col md:flex-row gap-4 mt-8">
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
