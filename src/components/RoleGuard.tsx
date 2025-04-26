
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { toast } from '@/components/ui/sonner';

interface RoleGuardProps {
  allowedRoles: UserRole | UserRole[];
  children: ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({ 
  allowedRoles, 
  children, 
  redirectTo = '/login' 
}: RoleGuardProps) {
  const { isAuthenticated, hasRole, loading, profile } = useAuth();
  
  // Aguarda o carregamento da autenticação
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div>
        <p className="ml-2 text-gray-500">Verificando permissões...</p>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Se o perfil não foi carregado corretamente
  if (!profile) {
    toast.warning('Perfil não encontrado', {
      description: 'Faça login novamente para continuar'
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Se não tiver o papel necessário, redireciona para a página não autorizada
  if (!hasRole(allowedRoles)) {
    toast.error('Acesso negado', {
      description: 'Você não tem permissão para acessar esta página'
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Se tudo estiver ok, renderiza os filhos
  return <>{children}</>;
}
