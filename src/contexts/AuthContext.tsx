import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log(`Buscando perfil para o usuário: ${userId}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('role, name, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        
        // Verificar se a tabela existe
        if (error.code === '42P01') {
          console.error('Tabela profiles não existe! Precisamos criá-la primeiro.');
        }
        return null;
      }

      console.log('Dados do perfil obtidos:', data);
      return data;
    } catch (error) {
      console.error('Erro em fetchProfile:', error);
      return null;
    }
  }, []);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!profile) {
      console.warn('hasRole check failed: No profile available', { user });
      return false;
    }
    
    if (Array.isArray(role)) {
      console.log('Verificando múltiplos papéis:', role, 'Papel atual:', profile.role);
      return role.includes(profile.role);
    }
    
    console.log('Verificando papel único:', role, 'Papel atual:', profile.role);
    return profile.role === role;
  }, [profile, user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Estado de autenticação alterado:', event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log('Buscando perfil para o usuário após mudança de estado:', currentSession.user.id);
          
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            
            if (profileData) {
              console.log('Definindo perfil com papel:', profileData.role);
              setProfile({
                role: profileData.role,
                name: profileData.name,
                avatar_url: profileData.avatar_url
              });
            } else {
              console.warn('Nenhum perfil encontrado para o usuário:', currentSession.user.id);
              setProfile(null);
            }
            
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Verificação de sessão inicial:', currentSession);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log('Busca inicial de perfil para o usuário:', currentSession.user.id);
          const profileData = await fetchProfile(currentSession.user.id);
          
          if (profileData) {
            console.log('Definindo perfil inicial com papel:', profileData.role);
            setProfile({
              role: profileData.role,
              name: profileData.name,
              avatar_url: profileData.avatar_url
            });
          } else {
            console.warn('Nenhum perfil inicial encontrado para o usuário:', currentSession.user.id);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Erro durante inicialização da autenticação:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    try {
      console.log(`Tentando fazer login com o e-mail: ${email}`);
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        console.log('Login bem-sucedido, buscando perfil para:', data.user.id);
        const profileData = await fetchProfile(data.user.id);
        
        if (profileData) {
          console.log('Perfil encontrado com papel:', profileData.role);
          setProfile({
            role: profileData.role,
            name: profileData.name,
            avatar_url: profileData.avatar_url
          });
        } else {
          console.warn('Nenhum perfil encontrado após login para o usuário:', data.user.id);
        }
      }
      
      toast.success('Login realizado com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error('Erro no login', {
        description: error.message || 'Verifique suas credenciais'
      });
      throw error;
    } finally {
      setLoading(false);
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
      setUser(null);
      setProfile(null);
      setSession(null);
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
