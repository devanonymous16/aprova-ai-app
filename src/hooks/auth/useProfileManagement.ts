
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { fetchUserProfile } from '@/utils/authUtils';
import { toast } from '@/components/ui/sonner';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

interface ProfileType {
  role: UserRole;
  name: string;
  avatar_url?: string | null;
}

export const useProfileManagement = (user: User | null) => {
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const updateProfile = useCallback(async (currentUser: User) => {
    try {
      console.log('Fetching profile for user:', currentUser.id);
      
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.error('Sem conexão com o Supabase ao tentar carregar perfil');
        return null;
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
      } else {
        console.error('No profile data returned for user:', currentUser.id);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      setProfile(null);
    }
  }, []);

  return { profile, updateProfile };
};
