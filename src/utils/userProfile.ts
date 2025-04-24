
import { supabase } from '@/integrations/supabase/client';

export const fetchUserProfile = async (userId: string, userEmail?: string | null) => {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', { code: error.code, message: error.message });
      
      if (userEmail) {
        console.log('No profile found, creating default profile');
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data) {
      console.log('No profile found, creating default profile');
      if (userEmail) {
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    console.log('Profile found:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

export const createDefaultProfile = async (userId: string, email: string) => {
  console.log('Creating default profile for:', userId);
  
  let defaultRole: 'student' | 'manager' | 'admin' = 'student';
  if (email.includes('admin')) defaultRole = 'admin';
  else if (email.includes('manager')) defaultRole = 'manager';
  
  try {
    console.log('Default role assigned based on email pattern:', defaultRole);
    console.log('Inserting profile data into profiles table...');
    
    const profileData = {
      id: userId,
      email,
      name: email.split('@')[0],
      role: defaultRole
    };
    
    console.log('Profile data to insert:', profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select('role, name, avatar_url')
      .single();
      
    if (error) {
      console.error('Error creating default profile:', error);
      console.error('Error details:', { code: error.code, message: error.message });
      return null;
    }
    
    console.log('Default profile created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createDefaultProfile:', error);
    return null;
  }
};
