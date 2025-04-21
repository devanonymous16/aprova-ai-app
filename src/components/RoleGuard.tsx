
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

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
  const { isAuthenticated, hasRole, loading } = useAuth();
  
  // Aguarda o carregamento da autenticação
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }
  
  // Se não tiver o papel necessário, redireciona para o dashboard ou página apropriada
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" />;
  }
  
  // Se tudo estiver ok, renderiza os filhos
  return <>{children}</>;
}
