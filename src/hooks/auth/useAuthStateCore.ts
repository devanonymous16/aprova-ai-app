
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfileManagement } from './useProfileManagement';
import { useConnectionState } from './useConnectionState';
import { useRetryMechanism } from './useRetryMechanism';
import { toast } from '@/components/ui/sonner';

export const useAuthStateCore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const { profile, updateProfile } = useProfileManagement(user);
  const { connectionError, setConnectionError, checkConnection, startPeriodicCheck } = useConnectionState();
  const { retryCount, handleRetry } = useRetryMechanism(user, profile, updateProfile);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      setLoading(true);
      try {
        console.log('Inicializando estado de autenticação');
        
        const isConnected = await checkConnection();
        if (!isConnected && isMounted) {
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
          await updateProfile(currentSession.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await updateProfile(currentSession.user);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );
    
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth state loading timeout - forcing load completion');
        setLoading(false);
      }
    }, 10000);
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [updateProfile, loading, checkConnection]);

  useEffect(() => {
    if (connectionError) {
      return startPeriodicCheck();
    }
  }, [connectionError, startPeriodicCheck]);

  useEffect(() => {
    return handleRetry();
  }, [handleRetry]);

  return {
    user,
    profile,
    session,
    loading,
    connectionError,
    isAuthenticated: !!user
  };
};
