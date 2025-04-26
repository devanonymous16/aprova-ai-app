
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { fetchUserProfile } from '@/utils/auth';
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

  const updateProfile = useCallback(async (currentUser: User) => {
    if (!currentUser.id) {
      throw new Error('User ID required to fetch profile');
    }

    console.log('[updateProfile] Iniciando fetchUserProfile para user ID:', currentUser.id);
    
    try {
      const profileData = await fetchUserProfile(currentUser.id, currentUser.email);
      
      console.log('[updateProfile] fetchUserProfile concluído:', profileData ? 'Dados encontrados' : 'Sem dados');
      
      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile(null);
        toast.error('Erro ao carregar perfil', {
          description: 'Não foi possível recuperar suas informações'
        });
      }
    } catch (error) {
      console.error('[updateProfile] Erro ao buscar perfil:', error);
      setProfile(null);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      console.log('[updateProfile] Finalizando e definindo loading=false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[AUTH EFFECT] Configurando onAuthStateChange listener...');
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('>>> [onAuthStateChange CALLBACK INICIADO] Evento:', event, 'Sessão Existe:', !!currentSession);
        
        if (!mounted) {
          console.log('>>> [onAuthStateChange] Componente desmontado, ignorando evento');
          return;
        }

        try {
          console.log('>>> [onAuthStateChange] Definindo loading=true');
          setLoading(true);

          if (event === 'SIGNED_OUT') {
            console.log('>>> [onAuthStateChange] Evento SIGNED_OUT, limpando estados');
            setUser(null);
            setSession(null);
            setProfile(null);
            setError(null);
            console.log('>>> [onAuthStateChange] Estados limpos após SIGNED_OUT');
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            console.log('>>> [onAuthStateChange] Evento', event, 'atualizando estados');
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user) {
              console.log('>>> [onAuthStateChange] Chamando updateProfile com user:', currentSession.user.email);
              await updateProfile(currentSession.user);
            }
          }
        } catch (error) {
          console.error('>>> [onAuthStateChange] Erro:', error);
          setError(error instanceof Error ? error : new Error(String(error)));
        } finally {
          if (mounted) {
            console.log('>>> [onAuthStateChange] Finalizando (mounted=true), definindo loading=false');
            setLoading(false);
          } else {
            console.log('>>> [onAuthStateChange] Finalizando (mounted=false), não alterando estado');
          }
        }
      }
    );

    console.log('[AUTH EFFECT] Listener configurado. Subscription:', subscription);

    const initializeAuth = async () => {
      console.log('[initializeAuth] Iniciando verificação de sessão existente');
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('[initializeAuth] Componente desmontado, ignorando resultados');
          return;
        }

        const currentSession = data.session;
        console.log('[initializeAuth] Sessão existente:', currentSession ? 'Sim' : 'Não');
        setSession(currentSession);

        if (currentSession?.user) {
          console.log('[initializeAuth] Usuário encontrado na sessão:', currentSession.user.email);
          setUser(currentSession.user);
          await updateProfile(currentSession.user);
        } else {
          console.log('[initializeAuth] Sem usuário na sessão, limpando estados');
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('[initializeAuth] Erro:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('[AUTH EFFECT CLEANUP] Limpando listener.');
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
