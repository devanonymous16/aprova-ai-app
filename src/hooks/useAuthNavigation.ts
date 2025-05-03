import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Ajuste o path se necessário

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profile, loading } = useAuth();

  useEffect(() => {
    const currentPath = location.pathname; // Pega o caminho atual

    console.log('[AuthNav Effect] Verificando estado:', {
      pathname: currentPath,
      isAuthenticated,
      loading,
      hasProfile: !!profile,
      role: profile?.role,
    });

    // Só executa se o carregamento terminou
    if (!loading) {
      const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(currentPath);
      const baseDashboardPath = profile ? `/dashboard/${profile.role}` : null; // Ex: /dashboard/manager

      if (isAuthenticated && profile && baseDashboardPath) {
        // --- LÓGICA AJUSTADA ---
        // Se está logado, com perfil, E está numa página de autenticação, OU na raiz '/' (opcional)
        if (isAuthPage || currentPath === '/') {
            console.log(`[AuthNav Effect] Logado (${profile.role}) em pág auth/raiz. Redirecionando para ${baseDashboardPath}...`);
            navigate(baseDashboardPath, { replace: true });
        }
        // --- NÃO FAZ NADA SE JÁ ESTIVER EM OUTRA PÁGINA LOGADO ---
        // Antes, ele redirecionava sempre que detectava usuário logado.
        // Agora, só redireciona se estiver especificamente nas páginas de auth/raiz.
        // Isso permite navegar para sub-páginas como /dashboard/manager/students/.../manage
        // --- FIM DA LÓGICA AJUSTADA ---

      } else if (isAuthenticated && !profile) {
        // Logado mas sem perfil
        console.warn('[AuthNav Effect] Usuário autenticado mas sem perfil carregado.');
        if (!isAuthPage && currentPath !== '/unauthorized') { // Evita loop se já estiver no erro
            // Talvez redirecionar para uma página de criação de perfil? Ou logout?
             // navigate('/create-profile', { replace: true }); // Exemplo
             // Por enquanto, vamos para unauthorized para indicar o problema
             console.log('[AuthNav Effect] Redirecionando para /unauthorized (logado sem perfil)');
             navigate('/unauthorized', { replace: true });
        }
      } else {
        // Não autenticado
        // Verifica se a rota atual é protegida (requer login)
        const isProtectedRoute = currentPath.startsWith('/dashboard') || currentPath.startsWith('/student/'); // Adicione outros prefixos protegidos se necessário

        if (isProtectedRoute) {
          console.log('[AuthNav Effect] Não logado tentando acessar rota protegida. Redirecionando para /login...');
          navigate('/login', { replace: true, state: { from: location } });
        } else {
           console.log('[AuthNav Effect] Não logado em página pública ou de auth.');
        }
      }
    } else {
       console.log('[AuthNav Effect] Ainda carregando autenticação...');
    }
  }, [isAuthenticated, profile, loading, navigate, location]); // location como dependência

  return null;
};