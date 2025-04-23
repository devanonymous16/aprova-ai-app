
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { fetchUserProfile } from '@/utils/authUtils';

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

  const updateProfile = useCallback(async (currentUser: User) => {
    try {
      console.log('Fetching profile for user:', currentUser.id);
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
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
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
      }
    }, 10000); // 10 segundos de timeout
    
    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [updateProfile]);

  // Add a retry mechanism for profile loading
  useEffect(() => {
    if (user && !profile && !loading && retryCount < 3) {
      console.log(`Tentativa ${retryCount + 1} de carregar perfil...`);
      const retryTimer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        updateProfile(user);
      }, 2000); // Tenta novamente após 2 segundos
      
      return () => clearTimeout(retryTimer);
    }
  }, [user, profile, loading, retryCount, updateProfile]);

  return {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user
  };
};
