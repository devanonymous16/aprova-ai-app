
import { ReactNode, useEffect, useState } from 'react';
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
  console.log('[DIAGNÓSTICO] RoleGuard: INICIANDO...', { allowedRoles, redirectTo });
  
  const { isAuthenticated, hasRole, loading, profile, user } = useAuth();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
  // Adicionar proteção contra carregamento infinito
  useEffect(() => {
    console.log('[DIAGNÓSTICO] RoleGuard: Configurando timeout de segurança');
    const timeoutId = setTimeout(() => {
      console.log('[DIAGNÓSTICO] RoleGuard: TIMEOUT DE SEGURANÇA ATINGIDO (5s)');
      setTimeoutOccurred(true);
    }, 5000); // 5 segundos como limite máximo para loading
    
    return () => {
      console.log('[DIAGNÓSTICO] RoleGuard: Limpando timeout de segurança');
      clearTimeout(timeoutId);
    };
  }, []);
  
  useEffect(() => {
    console.log('[DIAGNÓSTICO] RoleGuard - Auth State:', {
      isAuthenticated,
      loading,
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? {
        role: profile.role,
        name: profile.name
      } : null,
      allowedRoles,
      timeoutOccurred
    });
  }, [isAuthenticated, loading, profile, user, allowedRoles, timeoutOccurred]);
  
  // Se o timeout ocorreu e ainda está carregando, forçamos redirecionamento para login
  if (timeoutOccurred && loading) {
    console.error('[DIAGNÓSTICO] RoleGuard: ERRO CRÍTICO - Timeout durante carregamento da autenticação');
    toast.error('Erro ao verificar autenticação', {
      description: 'Por favor, tente novamente em alguns instantes'
    });
    console.log('[DIAGNÓSTICO] RoleGuard: Redirecionando para', redirectTo, 'devido a timeout');
    return <Navigate to={redirectTo} />;
  }
  
  // Aguarda o carregamento da autenticação
  if (loading) {
    console.log('[DIAGNÓSTICO] RoleGuard: Ainda carregando estado de autenticação...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div>
        <p className="ml-2 text-gray-500">Verificando permissões...</p>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    console.log('[DIAGNÓSTICO] RoleGuard: Usuário não autenticado, redirecionando para', redirectTo);
    return <Navigate to={redirectTo} />;
  }
  
  // Se o perfil não foi carregado corretamente
  if (!profile) {
    console.log('[DIAGNÓSTICO] RoleGuard: Perfil de usuário não carregado, redirecionando para unauthorized');
    toast.warning('Perfil não encontrado', {
      description: 'Faça login novamente para continuar'
    });
    return <Navigate to="/unauthorized" />;
  }
  
  // Se não tiver o papel necessário, redireciona para a página não autorizada
  if (!hasRole(allowedRoles)) {
    console.log(`[DIAGNÓSTICO] RoleGuard: Usuário não tem permissão necessária: Current role=${profile.role}, Required=${Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}`);
    toast.error('Acesso negado', {
      description: 'Você não tem permissão para acessar esta página'
    });
    return <Navigate to="/unauthorized" />;
  }
  
  // Se tudo estiver ok, renderiza os filhos
  console.log('[DIAGNÓSTICO] RoleGuard: Acesso concedido, renderizando children');
  return <>{children}</>;
}
