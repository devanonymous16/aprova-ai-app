import React, { createContext, useContext, useCallback, ReactNode, useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { UserRole } from '@/types/user';

interface AuthContextType {
  user: ReturnType<typeof useAuthState>['user'];
  profile: ReturnType<typeof useAuthState>['profile'];
  session: ReturnType<typeof useAuthState>['session'];
  loading: ReturnType<typeof useAuthState>['loading'];
  isAuthenticated: ReturnType<typeof useAuthState>['isAuthenticated'];
  hasRole: (role: UserRole | UserRole[]) => boolean;
  login: ReturnType<typeof useAuthActions>['login'];
  loginWithGoogle: ReturnType<typeof useAuthActions>['loginWithGoogle'];
  logout: ReturnType<typeof useAuthActions>['logout'];
  signUp: ReturnType<typeof useAuthActions>['signUp'];
  forgotPassword: ReturnType<typeof useAuthActions>['forgotPassword'];
  resetPassword: ReturnType<typeof useAuthActions>['resetPassword'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('[DIAGNÓSTICO] AuthContext: Provider montando...');
  
  const {
    user,
    profile,
    session,
    loading,
    isAuthenticated
  } = useAuthState();
  
  useEffect(() => {
    console.log('[DIAGNÓSTICO] AuthContext: Estado de autenticação atualizado:', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasProfile: !!profile,
      loading 
    });
  }, [isAuthenticated, user, profile, loading]);

  const {
    login,
    loginWithGoogle,
    logout: authActionsLogout,
    signUp,
    forgotPassword,
    resetPassword
  } = useAuthActions();

  const logout = useCallback(async () => {
    console.log('[DIAGNÓSTICO LOGOUT] AuthContext.logout chamado');
    console.log('[DIAGNÓSTICO LOGOUT] Estado antes do logout:', { 
      user: !!user, 
      session: !!session, 
      profile: !!profile, 
      isAuthenticated 
    });
    
    try {
      console.log('[DIAGNÓSTICO LOGOUT] Delegando para authActionsLogout');
      await authActionsLogout();
      console.log('[DIAGNÓSTICO LOGOUT] authActionsLogout concluído, verifique se redirecionou');
    } catch (error) {
      console.error('[DIAGNÓSTICO LOGOUT] Erro no AuthContext.logout:', error);
      console.log('[DIAGNÓSTICO LOGOUT] Forçando redirecionamento mesmo após erro');
      window.location.href = '/login';
    }
  }, [authActionsLogout, user, session, profile, isAuthenticated]);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    try {
      if (!profile) {
        console.warn('[DIAGNÓSTICO] hasRole check falhou: Nenhum perfil disponível', { user });
        return false;
      }
      
      if (Array.isArray(role)) {
        console.log('[DIAGNÓSTICO] Verificando múltiplos papéis:', role, 'Papel atual:', profile.role);
        return role.includes(profile.role);
      }
      
      console.log('[DIAGNÓSTICO] Verificando papel único:', role, 'Papel atual:', profile.role);
      return profile.role === role;
    } catch (error) {
      console.error('[DIAGNÓSTICO] Erro em hasRole:', error);
      return false;
    }
  }, [profile, user]);

  console.log('[DIAGNÓSTICO] AuthContext: Preparando provider value');
  
  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isAuthenticated,
      hasRole,
      login,
      loginWithGoogle,
      logout,
      signUp,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  try {
    console.log('[DIAGNÓSTICO] useAuth hook sendo chamado');
    const context = useContext(AuthContext);
    if (!context) {
      console.error('[DIAGNÓSTICO] useAuth: ERRO - hook usado fora de AuthProvider');
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  } catch (error) {
    console.error('[DIAGNÓSTICO] Erro no hook useAuth:', error);
    throw error;
  }
};
