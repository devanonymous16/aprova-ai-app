
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
        toast.loading('Criando perfil padrão...');
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data) {
      console.log('No profile found, creating default profile');
      if (userEmail) {
        toast.loading('Criando perfil padrão...');
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
    // First check if profile already exists to avoid duplicate entries
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      console.log('Profile already exists, updating instead of creating');
      const { data, error } = await supabase
        .from('profiles')
        .update({
          email,
          name: email.split('@')[0],
          role: defaultRole
        })
        .eq('id', userId)
        .select('role, name, avatar_url')
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success('Perfil atualizado com sucesso');
      return data;
    }
  
    // If no profile exists, create a new one
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

// Add utility function to validate and ensure a user profile exists
export const ensureUserProfile = async (user: User | null) => {
  if (!user) return null;
  
  try {
    const profile = await fetchUserProfile(user.id, user.email);
    return profile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return null;
  }
};
