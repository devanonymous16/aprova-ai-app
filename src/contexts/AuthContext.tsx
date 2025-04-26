
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

  const logout = useCallback(async () => {
    try {
      await authActionsLogout();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  }, [authActionsLogout]);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!profile) return false;
    
    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }
    
    return profile.role === role;
  }, [profile]);

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
