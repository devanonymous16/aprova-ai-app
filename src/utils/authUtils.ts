
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

export const fetchUserProfile = async (userId: string, userEmail?: string) => {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      
      if (userEmail) {
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

export const createDefaultProfile = async (userId: string, email: string) => {
  console.log('Creating default profile for:', userId);
  
  let defaultRole: UserRole = 'student';
  if (email.includes('admin')) defaultRole = 'admin';
  else if (email.includes('manager')) defaultRole = 'manager';
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        name: email.split('@')[0],
        role: defaultRole
      })
      .select('role, name, avatar_url')
      .single();
      
    if (error) {
      console.error('Error creating default profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createDefaultProfile:', error);
    return null;
  }
};
