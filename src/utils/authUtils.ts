import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

// New interface to explicitly type test users
interface TestUser {
  email: string;
  password: string;
  role: 'student' | 'manager' | 'admin';
}

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
  
  // Ensure role is strictly typed to be compatible with Supabase DB enum
  // Exclude 'visitor' from role options for database
  let defaultRole: 'student' | 'manager' | 'admin' = 'student';
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
    
    console.log('Default profile created:', data);
    return data;
  } catch (error) {
    console.error('Error in createDefaultProfile:', error);
    return null;
  }
};

export const repairUserProfiles = async () => {
  try {
    console.log('Verificando usuários sem perfil...');
    
    // Obter todos os usuários
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Erro ao listar usuários:', authError);
      return false;
    }
    
    if (!authData?.users?.length) {
      console.log('Nenhum usuário encontrado');
      return true;
    }
    
    // Para cada usuário, verificar se tem perfil
    for (const user of authData.users) {
      if (!user.email) {
        console.log(`Usuário ${user.id} não tem email, pulando...`);
        continue;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error(`Erro ao verificar perfil do usuário ${user.email}:`, error);
        continue;
      }
      
      if (!data) {
        console.log(`Usuário ${user.email} não tem perfil, criando...`);
        
        // Determinar role - use only valid Supabase enum values
        let role: 'student' | 'manager' | 'admin' = 'student';
        if (user.email?.includes('admin')) role = 'admin';
        else if (user.email?.includes('manager')) role = 'manager';
        
        // Criar perfil
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.email?.split('@')[0] || 'Usuário',
            role: role
          });
          
        if (insertError) {
          console.error(`Erro ao criar perfil para ${user.email}:`, insertError);
        } else {
          console.log(`Perfil criado com sucesso para ${user.email}`);
        }
      } else {
        console.log(`Usuário ${user.email} já tem perfil`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao reparar perfis:', error);
    return false;
  }
};
