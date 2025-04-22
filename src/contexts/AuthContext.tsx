import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/user';
import { toast } from '@/components/ui/sonner';

interface ProfileType {
  role: UserRole;
  name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileType | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função auxiliar para buscar o perfil do usuário
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Primeiro, configure o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id);
          if (profileData) {
            setProfile({
              role: profileData.role,
              name: profileData.name,
              avatar_url: profileData.avatar_url
            });
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Depois, verifique a sessão atual
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const profileData = await fetchProfile(currentSession.user.id);
        if (profileData) {
          setProfile({
            role: profileData.role,
            name: profileData.name,
            avatar_url: profileData.avatar_url
          });
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Login realizado com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Erro no login', {
        description: error.message || 'Verifique suas credenciais'
      });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error('Erro no login com Google', {
        description: error.message || 'Tente novamente mais tarde'
      });
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro no logout');
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'student' // Default role for new users
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Conta criada com sucesso');
      // Note: Não navegamos automaticamente após o signup devido à confirmação de email
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Erro no cadastro', {
        description: error.message || 'Não foi possível criar a conta'
      });
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return;
    } catch (error: any) {
      toast.error('Erro ao enviar email de recuperação', {
        description: error.message || 'Verifique se o email está correto'
      });
      throw error;
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Senha alterada com sucesso');
      navigate('/login');
      return;
    } catch (error: any) {
      toast.error('Erro ao alterar senha', {
        description: error.message || 'Por favor, tente novamente ou solicite um novo link'
      });
      throw error;
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!profile) return false;
    
    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }
    
    return profile.role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isAuthenticated: !!user,
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
