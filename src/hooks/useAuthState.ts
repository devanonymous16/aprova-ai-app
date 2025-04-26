import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { fetchUserProfile } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

interface ProfileType {
  role: UserRole;
  name: string;
  avatar_url?: string | null;
}

export const useAuthState = () => {
  console.log('[DIAGNÓSTICO AUTH] useAuthState: Hook inicializando...', {
    timestamp: new Date().toISOString()
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const updateProfile = useCallback(async (currentUser: User) => {
    console.log('[DIAGNÓSTICO AUTH] updateProfile: Iniciando...', {
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      email: currentUser.email
    });
    
    try {
      const profileData = await fetchUserProfile(
        currentUser.id,
        currentUser.email
      );
      
      console.log('[DIAGNÓSTICO AUTH] updateProfile: Resultado fetchUserProfile:', {
        timestamp: new Date().toISOString(),
        success: !!profileData
      });
      
      if (profileData) {
        console.log('[DIAGNÓSTICO AUTH] updateProfile: Atualizando estado do perfil', {
          timestamp: new Date().toISOString(),
          role: profileData.role
        });
        
        setProfile({
          role: profileData.role as UserRole,
          name: profileData.name,
          avatar_url: profileData.avatar_url
        });
      } else {
        console.error('[DIAGNÓSTICO AUTH] updateProfile: Falha ao carregar perfil', {
          timestamp: new Date().toISOString(),
          userId: currentUser.id
        });
        setProfile(null);
        toast.error('Erro ao carregar perfil', {
          description: 'Não foi possível recuperar suas informações'
        });
      }
    } catch (error) {
      console.error('[DIAGNÓSTICO AUTH] updateProfile: Erro crítico:', {
        timestamp: new Date().toISOString(),
        error
      });
      setProfile(null);
      setError(error instanceof Error ? error : new Error(String(error)));
      toast.error('Erro ao carregar perfil', {
        description: 'Ocorreu um erro inesperado'
      });
    } finally {
      console.log('[DIAGNÓSTICO AUTH] updateProfile: Finalizando e setando loading=false', {
        timestamp: new Date().toISOString()
      });
      setLoading(false);
      
      if (profile) {
        console.log('[DIAGNÓSTICO AUTH] updateProfile: Iniciando navegação pós-loading', {
          timestamp: new Date().toISOString(),
          role: profile.role
        });
        
        if (profile.role === 'student') {
          navigate('/dashboard/student');
        } else if (profile.role === 'manager') {
          navigate('/dashboard/manager');
        } else if (profile.role === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.log('[DIAGNÓSTICO AUTH] updateProfile: Redirecionando para /unauthorized', {
          timestamp: new Date().toISOString()
        });
        navigate('/unauthorized');
      }
    }
  }, [navigate, profile]);

  const clearAuthState = useCallback(() => {
    console.log('[DIAGNÓSTICO LOGOUT] useAuthState.clearAuthState: Limpando estado de autenticação explicitamente');
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log('[DIAGNÓSTICO AUTH] useEffect: Inicializando auth state...', {
      timestamp: new Date().toISOString()
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) {
          console.log('[DIAGNÓSTICO AUTH] onAuthStateChange: Componente desmontado, abortando');
          return;
        }
        
        try {
          console.log('[DIAGNÓSTICO AUTH] onAuthStateChange: Evento recebido:', {
            timestamp: new Date().toISOString(),
            event,
            hasSession: !!currentSession
          });
          
          setLoading(true);
          
          if (event === 'SIGNED_OUT') {
            console.log('[DIAGNÓSTICO AUTH] onAuthStateChange: SIGNED_OUT, limpando estado');
            setUser(null);
            setSession(null);
            setProfile(null);
            setLoading(false);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            console.log('[DIAGNÓSTICO AUTH] onAuthStateChange: Evento de autenticação:', event);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              await updateProfile(currentSession.user);
            } else {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error('[DIAGNÓSTICO AUTH] onAuthStateChange: Erro:', {
            timestamp: new Date().toISOString(),
            error
          });
          setError(error instanceof Error ? error : new Error(String(error)));
          setLoading(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        console.log('[DIAGNÓSTICO AUTH] initializeAuth: Iniciando...', {
          timestamp: new Date().toISOString()
        });
        
        const { data } = await supabase.auth.getSession();
        const currentSession = data.session;
        
        if (!isMounted) {
          console.log('[DIAGNÓSTICO AUTH] initializeAuth: Componente desmontado, abortando');
          return;
        }
        
        console.log('[DIAGNÓSTICO AUTH] initializeAuth: Sessão recuperada:', {
          timestamp: new Date().toISOString(),
          hasSession: !!currentSession
        });
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          await updateProfile(currentSession.user);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('[DIAGNÓSTICO AUTH] initializeAuth: Erro:', {
          timestamp: new Date().toISOString(),
          error
        });
        setUser(null);
        setProfile(null);
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      console.log('[DIAGNÓSTICO AUTH] Cleanup: Removendo subscription');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateProfile]);

  return {
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: !!user
  };
};
