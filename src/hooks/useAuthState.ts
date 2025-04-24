
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateProfile = useCallback(async (currentUser: User) => {
    try {
      console.log('Fetching profile for user:', currentUser.id, 'Email:', currentUser.email);
      const profileData = await fetchUserProfile(
        currentUser.id,
        currentUser.email
      );
      
      if (profileData) {
        console.log('Profile loaded successfully:', profileData);
        setProfile({
          role: profileData.role as UserRole,  // Explicitly cast to UserRole
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
    }
  }, []);

  useEffect(() => {
    console.log('Initializing auth state...');
    
    // 1. Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed. Event:', event, 'Session:', currentSession ? 'exists' : 'null');
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log('User authenticated, fetching profile...');
          await updateProfile(currentSession.user);
        } else {
          console.log('User signed out or session expired');
          setProfile(null);
        }
      }
    );

    // 2. Initialize auth state from stored session
    const initializeAuth = async () => {
      try {
        console.log('Getting stored session...');
        const { data } = await getCurrentSession();
        const currentSession = data.session;
        
        console.log('Retrieved session:', currentSession ? 'exists' : 'null');
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('User from stored session:', currentSession.user.email);
          setUser(currentSession.user);
          await updateProfile(currentSession.user);
        } else {
          console.log('No stored session found');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
        console.log('Auth initialization complete');
      }
    };
    
    initializeAuth();
    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [updateProfile]);

  return {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user
  };
};
