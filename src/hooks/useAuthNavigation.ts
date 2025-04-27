
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, profile, user } = useAuth();

  useEffect(() => {
    console.log('[NAV EFFECT] Verificando estado:', { 
      isAuthenticated, 
      loading, 
      profileExists: !!profile, 
      userId: user?.id 
    });

    if (!loading && isAuthenticated) {
      if (profile) {
        console.log('[NAV EFFECT] Autenticado, loading=false, perfil carregado. Verificando role:', profile.role);
        
        switch (profile.role) {
          case 'student':
            console.log('[NAV EFFECT] Redirecionando para /dashboard/student...');
            navigate('/dashboard/student', { replace: true });
            break;
          case 'manager':
            console.log('[NAV EFFECT] Redirecionando para /dashboard/manager...');
            navigate('/dashboard/manager', { replace: true });
            break;
          case 'admin':
            console.log('[NAV EFFECT] Redirecionando para /dashboard/admin...');
            navigate('/dashboard/admin', { replace: true });
            break;
          default:
            console.warn('[NAV EFFECT] Role de perfil desconhecido:', profile.role);
            navigate('/unauthorized', { replace: true });
        }
      } else {
        console.warn('[NAV EFFECT] Autenticado, loading=false, mas SEM perfil');
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, loading, profile, navigate, user]);
};
