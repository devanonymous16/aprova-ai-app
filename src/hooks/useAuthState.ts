
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getCurrentSession, getCurrentUser } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { fetchUserProfile } from '@/utils/auth';

// Define the ProfileType interface locally since it's not exported from @/types/user
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

  const updateProfile = useCallback(async (currentUser: User) => {
    try {
      console.log('[DIAGNÓSTICO] useAuthState.updateProfile: Buscando perfil para usuário:', currentUser.id, 'Email:', currentUser.email);
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
      } else {
        console.error('[DIAGNÓSTICO] useAuthState.updateProfile: Nenhum dado de perfil retornado para usuário:', currentUser.id);
        setProfile(null);
      }
    } catch (error) {
      console.error('[DIAGNÓSTICO] useAuthState.updateProfile: Erro:', error);
      setProfile(null);
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  // Limpa todo o estado de autenticação
  const clearAuthState = useCallback(() => {
    console.log('[DIAGNÓSTICO LOGOUT] useAuthState.clearAuthState: Limpando estado de autenticação explicitamente');
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log('[DIAGNÓSTICO] useAuthState: Inicializando auth state...');
    
    // 1. Set up auth state change listener with detailed logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) {
          console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Componente desmontado, abortando');
          return;
        }
        
        try {
          console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento recebido:', event);
          console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Sessão recebida:', currentSession ? 'Existe sessão' : 'Sem sessão');
          
          if (event === 'SIGNED_OUT') {
            console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento SIGNED_OUT detectado, limpando estado...');
            setUser(null);
            setSession(null);
            setProfile(null);
          } else if (event === 'SIGNED_IN') {
            console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento SIGNED_IN detectado');
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Atualizando perfil após login');
              await updateProfile(currentSession.user);
            }
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento TOKEN_REFRESHED detectado');
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          } else if (event === 'USER_UPDATED') {
            console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Evento USER_UPDATED detectado');
            if (currentSession?.user) {
              setUser(currentSession.user);
              await updateProfile(currentSession.user);
            }
          } else {
            console.log('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Outro evento detectado:', event);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              await updateProfile(currentSession.user);
            } else {
              setProfile(null);
            }
          }
        } catch (error) {
          console.error('[DIAGNÓSTICO] useAuthState.onAuthStateChange: Erro no handler de evento:', error);
          setError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    );

    // 2. Initialize auth state from stored session
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
