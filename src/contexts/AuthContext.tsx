
import React, { createContext, useContext, useCallback, ReactNode } from 'react';
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
  const {
    user,
    profile,
    session,
    loading,
    isAuthenticated
  } = useAuthState();

  const {
    login,
    loginWithGoogle,
    logout: authActionsLogout,
    signUp,
    forgotPassword,
    resetPassword
  } = useAuthActions();

  // Wrapper para adicionar logs no logout
  const logout = useCallback(async () => {
    console.log('[DIAGNÓSTICO LOGOUT] AuthContext.logout chamado, autenticado =', isAuthenticated);
    console.log('[DIAGNÓSTICO LOGOUT] Estado antes do logout:', { user: !!user, session: !!session, profile: !!profile });
    
    try {
      await authActionsLogout();
      console.log('[DIAGNÓSTICO LOGOUT] authActionsLogout concluído com sucesso');
    } catch (error) {
      console.error('[DIAGNÓSTICO LOGOUT] Erro no AuthContext.logout:', error);
      throw error;
    }
  }, [authActionsLogout, isAuthenticated, user, session, profile]);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!profile) {
      console.warn('hasRole check failed: No profile available', { user });
      return false;
    }
    
    if (Array.isArray(role)) {
      console.log('Checking multiple roles:', role, 'Current role:', profile.role);
      return role.includes(profile.role);
    }
    
    console.log('Checking single role:', role, 'Current role:', profile.role);
    return profile.role === role;
  }, [profile, user]);

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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
