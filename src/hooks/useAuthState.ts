
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
    console.log('[AUTH DEBUG - updateProfile] Iniciando com:', { 
      userId: currentUser.id,
      userEmail: currentUser.email,
      timestamp: new Date().toISOString()
    });

    try {
      console.log('[AUTH DEBUG - updateProfile] ANTES de fetchUserProfile:', {
        userId: currentUser.id,
        email: currentUser.email,
        supabaseInitialized: !!supabase
      });

      if (!currentUser.id) {
        console.error('[AUTH DEBUG - updateProfile] ERRO: userId ausente!');
        throw new Error('User ID ausente para buscar perfil.');
      }

      const profileData = await fetchUserProfile(currentUser.id, currentUser.email);
      
      console.log('[AUTH DEBUG - updateProfile] APÓS fetchUserProfile:', {
        success: !!profileData,
        profileData: profileData ? {
          role: profileData.role,
          name: profileData.name
        } : null,
        timestamp: new Date().toISOString()
      });
      
      if (profileData) {
        console.log('[AUTH DEBUG - updateProfile] Perfil obtido com sucesso:', {
          role: profileData.role,
          name: profileData.name
        });
        setProfile(profileData);
      } else {
        console.log('[AUTH DEBUG - updateProfile] Perfil não encontrado');
        setProfile(null);
        toast.error('Erro ao carregar perfil', {
          description: 'Não foi possível recuperar suas informações'
        });
      }
    } catch (error) {
      console.error('[AUTH DEBUG - updateProfile] ERRO CAPTURADO:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        timestamp: new Date().toISOString()
      });
      setProfile(null);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      console.log('[AUTH DEBUG - updateProfile] Finalizando execução:', {
        timestamp: new Date().toISOString(),
        status: 'setLoading(false)'
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user && profile) {
      const targetRoute = profile.role === 'student' 
        ? '/dashboard/student'
        : profile.role === 'manager'
          ? '/dashboard/manager'
          : profile.role === 'admin'
            ? '/dashboard/admin'
            : '/dashboard';
      
      console.log('[AUTH DEBUG] Navegando para:', targetRoute);
      navigate(targetRoute);
    } else if (!loading && user && !profile) {
      console.log('[AUTH DEBUG] Redirecionando para /unauthorized (sem perfil)');
      navigate('/unauthorized');
    }
  }, [profile, loading, user, navigate]);

  useEffect(() => {
    console.log('[AUTH DEBUG] Iniciando efeito principal de autenticação');
    let mounted = true;

    try {
      console.log('[AUTH EFFECT] Configurando onAuthStateChange listener...');
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log('>>> [onAuthStateChange CALLBACK INICIADO] Evento:', event);
          
          if (!mounted) {
            console.log('[AUTH DEBUG] Componente desmontado, ignorando evento:', event);
            return;
          }

          try {
            console.log('[AUTH DEBUG] Auth state change:', { event, session: currentSession?.user?.email });
            setLoading(true);

            if (event === 'SIGNED_OUT') {
              console.log('[AUTH DEBUG] Usuário deslogado, limpando estados');
              setUser(null);
              setSession(null);
              setProfile(null);
              setLoading(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              console.log('[AUTH DEBUG] Atualizando sessão e usuário');
              setSession(currentSession);
              setUser(currentSession?.user ?? null);

              if (currentSession?.user) {
                console.log('[AUTH DEBUG] Atualizando perfil do usuário');
                await updateProfile(currentSession.user);
              } else {
                console.log('[AUTH DEBUG] Sem usuário na sessão');
                setLoading(false);
              }
            }
          } catch (error) {
            console.error('[AUTH DEBUG] Erro no callback de auth state:', error);
            setError(error instanceof Error ? error : new Error(String(error)));
            setLoading(false);
          }
        }
      );

      console.log('[AUTH EFFECT] Listener configurado. Subscription:', subscription);

      const initializeAuth = async () => {
        try {
          console.log('[AUTH DEBUG] Iniciando inicialização de auth');
          const { data } = await supabase.auth.getSession();
          
          if (!mounted) {
            console.log('[AUTH DEBUG] Componente desmontado durante inicialização');
            return;
          }

          const currentSession = data.session;
          setSession(currentSession);

          if (currentSession?.user) {
            console.log('[AUTH DEBUG] Sessão encontrada, atualizando usuário e perfil');
            setUser(currentSession.user);
            await updateProfile(currentSession.user);
          } else {
            console.log('[AUTH DEBUG] Nenhuma sessão encontrada');
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('[AUTH DEBUG] Erro em initializeAuth:', error);
          setError(error instanceof Error ? error : new Error(String(error)));
          setLoading(false);
        }
      };

      initializeAuth();

      return () => {
        console.log('[AUTH EFFECT CLEANUP] Limpando listener');
        mounted = false;
        if (subscription) {
          console.log('[AUTH EFFECT CLEANUP] Executando unsubscribe');
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('[AUTH DEBUG] Erro fatal no efeito de auth:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
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
