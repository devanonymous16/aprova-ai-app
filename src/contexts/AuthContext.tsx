
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
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession) {
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('role, name, avatar_url')
          .eq('id', currentSession.user.id)
          .single();

        if (data) {
          setProfile({
            role: data.role,
            name: data.name,
            avatar_url: data.avatar_url
          });
        }
      }
      
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession) {
          const { data } = await supabase
            .from('profiles')
            .select('role, name, avatar_url')
            .eq('id', currentSession.user.id)
            .single();

          setProfile(data ? {
            role: data.role,
            name: data.name,
            avatar_url: data.avatar_url
          } : null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Login realizado com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Erro no login', {
        description: error.message || 'Verifique suas credenciais'
      });
      throw error;
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Conta criada com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Erro no cadastro', {
        description: error.message || 'Não foi possível criar a conta'
      });
      throw error;
    } finally {
      setLoading(false);
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
      logout,
      signUp,
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
