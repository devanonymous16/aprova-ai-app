
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { toast } from '@/components/ui/sonner';

export const fetchUserProfile = async (userId: string, userEmail?: string) => {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    
    // Verifica a conexão primeiro
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Sem conexão com o Supabase ao tentar carregar perfil');
      toast.error('Erro de conexão', { 
        description: 'Não foi possível carregar seu perfil. Verifique sua conexão.' 
      });
      return null;
    }
    
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
        console.log('Tentando criar perfil padrão após erro na busca');
        toast.loading('Criando perfil padrão...');
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data) {
      console.log('No profile found, creating default profile');
      if (userEmail) {
        console.log('Criando perfil padrão para usuário novo');
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
  
  // Verifica a conexão primeiro
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    console.error('Sem conexão com o Supabase ao tentar criar perfil');
    toast.error('Erro de conexão', { 
      description: 'Não foi possível criar seu perfil. Verifique sua conexão.' 
    });
    return null;
  }
  
  let defaultRole: UserRole = 'student';
  if (email.includes('admin')) defaultRole = 'admin';
  else if (email.includes('manager')) defaultRole = 'manager';
  
  try {
    // First check if profile already exists to avoid duplicate entries
    console.log('Verificando se perfil já existe');
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, role, name, avatar_url')
      .eq('id', userId)
      .single();
      
    if (checkError) {
      console.log('Perfil não encontrado, criando um novo:', checkError.message);
    }
      
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
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil', { description: error.message });
        throw error;
      }
      
      toast.success('Perfil atualizado com sucesso');
      return data;
    }
  
    // If no profile exists, create a new one
    console.log('Criando novo perfil');
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
    console.log('Ensuring user profile exists for:', user.id);
    const profile = await fetchUserProfile(user.id, user.email);
    return profile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return null;
  }
};
