
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { fetchUserProfile } from '@/utils/authUtils';
import { toast } from '@/components/ui/sonner';

// Define the ProfileType interface locally since it's not exported from @/types/user
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
  const [retryCount, setRetryCount] = useState(0);
  const [connectionError, setConnectionError] = useState(false);

  const updateProfile = useCallback(async (currentUser: User) => {
    try {
      console.log('Fetching profile for user:', currentUser.id);
      
      // Verifica a conexão antes de buscar o perfil
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.error('Sem conexão com o Supabase ao tentar carregar perfil');
        setConnectionError(true);
        return;
      }
      
      const profileData = await fetchUserProfile(
        currentUser.id,
        currentUser.email
      );
      
      if (profileData) {
        console.log('Profile loaded successfully:', profileData);
        setProfile({
          role: profileData.role,
          name: profileData.name,
          avatar_url: profileData.avatar_url
        });
        setConnectionError(false);
      } else {
        console.error('No profile data returned for user:', currentUser.id);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      setProfile(null);
    } finally {
      // Always set loading to false after attempting to load the profile
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Initialize auth state
    const initializeAuth = async () => {
      setLoading(true);
      try {
        console.log('Inicializando estado de autenticação');
        
        // Verifica a conexão primeiro
        const isConnected = await checkSupabaseConnection();
        if (!isConnected && isMounted) {
          console.error('Sem conexão com o Supabase durante inicialização');
          setConnectionError(true);
          setLoading(false);
          return;
        }
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          if (isMounted) {
            toast.error('Erro ao carregar sessão', {
              description: error.message
            });
            setLoading(false);
          }
          return;
        }
        
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log('Usuário encontrado na sessão, buscando perfil');
          await updateProfile(currentSession.user);
        } else {
          console.log('Nenhum usuário na sessão');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Initialize auth immediately
    initializeAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // When auth state changes and we get a user, update the profile
          await updateProfile(currentSession.user);
        } else {
          // When signing out or no session, clear profile and set loading to false
          setProfile(null);
          setLoading(false);
        }
      }
    );
    
    // Implement a safety timeout to prevent indefinite loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth state loading timeout - forcing load completion');
        setLoading(false);
        
        // Se ainda estiver carregando após o timeout, provavelmente há um problema de conexão
        if (!profile && user) {
          toast.error('Tempo esgotado ao carregar perfil', {
            description: 'Possível problema de conexão com o servidor'
          });
        }
      }
    }, 10000); // 10 segundos de timeout
    
    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [updateProfile]);

  // Add a retry mechanism for profile loading with exponential backoff
  useEffect(() => {
    if (user && !profile && !loading && retryCount < 3) {
      console.log(`Tentativa ${retryCount + 1} de carregar perfil...`);
      
      // Calcula o tempo de espera com backoff exponencial (2s, 4s, 8s)
      const delay = Math.pow(2, retryCount) * 2000;
      
      const retryTimer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        updateProfile(user);
      }, delay);
      
      return () => clearTimeout(retryTimer);
    }
    
    // Se chegou ao limite de tentativas, mostra um aviso
    if (user && !profile && retryCount >= 3) {
      toast.error('Não foi possível carregar seu perfil', {
        description: 'Tente recarregar a página ou verificar sua conexão'
      });
    }
  }, [user, profile, loading, retryCount, updateProfile]);

  // Adiciona verificação periódica de conexão quando houver erro
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (connectionError) {
      intervalId = setInterval(async () => {
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          setConnectionError(false);
          clearInterval(intervalId);
          // Recarrega o perfil se houver usuário
          if (user) {
            updateProfile(user);
          }
        }
      }, 30000) as unknown as number; // Verifica a cada 30 segundos
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionError, user, updateProfile]);

  return {
    user,
    profile,
    session,
    loading,
    connectionError,
    isAuthenticated: !!user
  };
};
