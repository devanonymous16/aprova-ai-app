
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
  
  // Wait for authentication loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If authenticated but no profile, redirect to unauthorized
  if (!profile) {
    toast.warning('Perfil não encontrado', {
      description: 'Faça login novamente para continuar'
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If authenticated but wrong role, redirect to unauthorized
  if (!hasRole(allowedRoles)) {
    toast.error('Acesso negado', {
      description: 'Você não tem permissão para acessar esta página'
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If everything is ok, render children
  return <>{children}</>;
}
