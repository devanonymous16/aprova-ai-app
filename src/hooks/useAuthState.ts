
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

  const updateProfile = useCallback(async (currentUser: User) => {
    const profileData = await fetchUserProfile(
      currentUser.id,
      currentUser.email
    );
    
    if (profileData) {
      setProfile({
        role: profileData.role,
        name: profileData.name,
        avatar_url: profileData.avatar_url
      });
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(() => {
            updateProfile(currentSession.user);
          }, 500);
        } else {
          setProfile(null);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await updateProfile(currentSession.user);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    return () => subscription.unsubscribe();
  }, [updateProfile]);

  return {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user
  };
};
