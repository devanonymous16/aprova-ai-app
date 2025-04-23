
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { toast } from '@/components/ui/sonner';

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
      toast.error('Erro ao carregar perfil', { description: error.message });
      
      if (userEmail) {
        // Attempt to create a default profile if there was an error fetching
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data) {
      console.log('No profile found, creating default profile');
      if (userEmail) {
        // Create default profile if none exists
        return await createDefaultProfile(userId, userEmail);
      }
      toast.warning('Perfil não encontrado');
      return null;
    }

    console.log('Profile found:', data);
    return data;
  } catch (error: any) {
    console.error('Error in fetchUserProfile:', error);
    toast.error('Erro ao carregar perfil', { description: error.message });
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
      toast.error('Erro ao criar perfil padrão', { description: error.message });
      return null;
    }
    
    toast.success('Perfil criado com sucesso');
    return data;
  } catch (error: any) {
    console.error('Error in createDefaultProfile:', error);
    toast.error('Erro ao criar perfil padrão', { description: error.message });
    return null;
  }
};
