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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const updateProfile = useCallback(async (currentUser: User) => {
    console.log('[AUTH DEBUG] updateProfile iniciando:', {
      timestamp: new Date().toISOString(),
      userId: currentUser.id
    });
    
    try {
      const profileData = await fetchUserProfile(currentUser.id, currentUser.email);
      
      console.log('[AUTH DEBUG] Resultado fetchUserProfile:', {
        timestamp: new Date().toISOString(),
        success: !!profileData,
        profile: profileData
      });
      
      setProfile(null);
      
      if (!profileData) {
        console.error('[AUTH DEBUG] Perfil não encontrado:', {
          timestamp: new Date().toISOString(),
          userId: currentUser.id
        });
        toast.error('Erro ao carregar perfil', {
          description: 'Não foi possível recuperar suas informações'
        });
      }
    } catch (error) {
      console.error('[AUTH DEBUG] Erro em updateProfile:', {
        timestamp: new Date().toISOString(),
        error
      });
      setProfile(null);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      console.log('[AUTH DEBUG] updateProfile FINALLY - Setando loading=false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && profile) {
      console.log('[AUTH DEBUG] Navegação iniciando:', {
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
    } else if (!loading && user && !profile) {
      console.log('[AUTH DEBUG] Redirecionando para unauthorized:', {
        timestamp: new Date().toISOString(),
        hasUser: !!user
      });
      navigate('/unauthorized');
    }
  }, [profile, loading, user, navigate]);

  const clearAuthState = useCallback(() => {
    console.log('[DIAGNÓSTICO LOGOUT] useAuthState.clearAuthState: Limpando estado de autenticação explicitamente');
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    console.log('[AUTH DEBUG] useEffect auth state iniciando');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log('[AUTH DEBUG] Auth state change:', {
          event,
          hasSession: !!currentSession
        });
        
        try {
          setLoading(true);
          
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            setProfile(null);
            setLoading(false);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              await updateProfile(currentSession.user);
            } else {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error('[AUTH DEBUG] Error in auth state change:', error);
          setError(error instanceof Error ? error : new Error(String(error)));
          setLoading(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const currentSession = data.session;
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
        console.error('[AUTH DEBUG] Error in initializeAuth:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      mounted = false;
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
