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
    try {
      const profileData = await fetchUserProfile(currentUser.id, currentUser.email);
      
      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile(null);
        toast.error('Erro ao carregar perfil', {
          description: 'Não foi possível recuperar suas informações'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfile(null);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user && profile) {
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
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
          console.error('Error in auth state change:', error);
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
        console.error('Error in initializeAuth:', error);
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
