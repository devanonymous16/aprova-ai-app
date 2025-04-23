
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
      // Important: Set loading to false here to ensure we don't get stuck in loading state
      setLoading(false);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      setProfile(null);
      // Important: Set loading to false on error to avoid stuck in loading
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch profile immediately, not with setTimeout
          await updateProfile(currentSession.user);
        } else {
          setProfile(null);
          setLoading(false); // Ensure loading is set to false when no user
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
        } else {
          setLoading(false); // Important: Set loading to false if no user found
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setLoading(false); // Important: Set loading to false on error
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
