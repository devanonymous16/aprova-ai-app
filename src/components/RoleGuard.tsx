
import { ReactNode, useEffect } from 'react';
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
  const { isAuthenticated, hasRole, loading, profile, user } = useAuth();
  
  useEffect(() => {
    console.log('RoleGuard - Auth State:', {
      isAuthenticated,
      loading,
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? {
        role: profile.role,
        name: profile.name
      } : null,
      allowedRoles
    });
    
    if (profile) {
      console.log('Verificando permissão:', {
        userRole: profile.role,
        allowedRoles,
        hasAccess: hasRole(allowedRoles)
      });
    }
  }, [isAuthenticated, loading, profile, user, hasRole, allowedRoles]);
  
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
    console.log('RoleGuard: User not authenticated, redirecting to login');
    return <Navigate to={redirectTo} />;
  }
  
  // Se o perfil não foi carregado corretamente
  if (!profile) {
    console.log('RoleGuard: User profile not loaded, redirecting to unauthorized page');
    return <Navigate to="/unauthorized" />;
  }
  
  // Se não tiver o papel necessário, redireciona para a página não autorizada
  if (!hasRole(allowedRoles)) {
    console.log(`RoleGuard: User does not have required role(s): Current role=${profile.role}, Required=${Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}`);
    return <Navigate to="/unauthorized" />;
  }
  
  // Se tudo estiver ok, renderiza os filhos
  console.log('RoleGuard: Access granted');
  return <>{children}</>;
}
