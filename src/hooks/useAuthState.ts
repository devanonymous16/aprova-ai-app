import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getCurrentSession, getCurrentUser } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { fetchUserProfile } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

interface ProfileType {
  role: UserRole;
  name: string;
  avatar_url?: string | null;
}

export const useAuthState = () => {
  console.log('[DIAGNÓSTICO] useAuthState: Hook inicializando...');
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const updateProfile = useCallback(async (currentUser: User) => {
    try {
      console.log('[DIAGNÓSTICO] useAuthState.updateProfile: Buscando perfil para usuário:', currentUser.id, 'Email:', currentUser.email);
      setLoading(true);
      
      const profileData = await fetchUserProfile(
        currentUser.id,
        currentUser.email
      );
      
      if (profileData) {
        console.log('[DIAGNÓSTICO] useAuthState.updateProfile: Perfil carregado com sucesso:', profileData);
        setProfile({
          role: profileData.role as UserRole,
          name: profileData.name,
          avatar_url: profileData.avatar_url
        });
        
        if (profileData.role === 'student') {
          navigate('/dashboard/student');
        } else if (profileData.role === 'manager') {
          navigate('/dashboard/manager');
        } else if (profileData.role === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('[DIAGNÓSTICO] useAuthState.updateProfile: Nenhum dado de perfil retornado para usuário:', currentUser.id);
        setProfile(null);
        navigate('/unauthorized');
      }
    } catch (error) {
      console.error('[DIAGNÓSTICO] useAuthState.updateProfile: Erro:', error);
      setProfile(null);
      setError(error instanceof Error ? error : new Error(String(error)));
      navigate('/unauthorized');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const clearAuthState = useCallback(() => {
    console.log('[DIAGNÓSTICO LOGOUT] useAuthState.clearAuthState: Limpando estado de autenticação explicitamente');
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log('[DIAGNÓSTICO] useAuthState: Inicializando auth state...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) {
          console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Componente desmontado, abortando');
          return;
        }
        
        try {
          console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento recebido:', event);
          console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Sessão recebida:', currentSession ? 'Existe sessão' : 'Sem sessão');
          
          setLoading(true);
          
          if (event === 'SIGNED_OUT') {
            console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento SIGNED_OUT detectado, limpando estado...');
            setUser(null);
            setSession(null);
            setProfile(null);
            setLoading(false);
          } else if (event === 'SIGNED_IN') {
            console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento SIGNED_IN detectado');
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Atualizando perfil após login');
              await updateProfile(currentSession.user);
            }
          } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            console.log(`[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento ${event} detectado`);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              await updateProfile(currentSession.user);
            }
          }
        } catch (error) {
          console.error('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Erro no handler de evento:', error);
          setError(error instanceof Error ? error : new Error(String(error)));
          setLoading(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        console.log('[DIAGNÓSTICO] useAuthState.initializeAuth: Obtendo sessão armazenada...');
        const { data } = await getCurrentSession();
        const currentSession = data.session;
        
        if (!isMounted) {
          console.log('[DIAGNÓSTICO] useAuthState.initializeAuth: Componente desmontado, abortando');
          return;
        }
        
        console.log('[DIAGNÓSTICO] useAuthState.initializeAuth: Sessão recuperada:', currentSession ? 'existe' : 'null');
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('[DIAGNÓSTICO] useAuthState.initializeAuth: Usuário da sessão armazenada:', currentSession.user.email);
          setUser(currentSession.user);
          await updateProfile(currentSession.user);
        } else {
          console.log('[DIAGNÓSTICO] useAuthState.initializeAuth: Nenhuma sessão armazenada encontrada');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('[DIAGNÓSTICO] useAuthState.initializeAuth: Erro durante inicialização de auth:', error);
        setUser(null);
        setProfile(null);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('[DIAGNÓSTICO] useAuthState.initializeAuth: Inicialização completa, loading=false');
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      console.log('[DIAGNÓSTICO] useAuthState: Limpando subscription de auth');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateProfile, clearAuthState]);

  return {
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: !!user
  };
};
