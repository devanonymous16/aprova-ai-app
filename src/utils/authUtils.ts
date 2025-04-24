
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

// Função para criar manualmente os usuários de teste se necessário
export const createTestUsers = async () => {
  // Define test users with explicit TestUser type
  const testUsers: TestUser[] = [
    { email: 'student@forefy.com', password: 'Teste123', role: 'student' },
    { email: 'manager@forefy.com', password: 'Teste123', role: 'manager' },
    { email: 'admin@forefy.com', password: 'Teste123', role: 'admin' },
  ];
  
  console.log('Criando usuários de teste...');
  
  for (const user of testUsers) {
    const currentUserEmail = user.email;
    try {
      // Verificar se o usuário já existe
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`Erro ao listar usuários: ${listError.message}`);
        continue;
      }
      
      // Make sure we're explicitly checking the type before accessing properties
      // Add type guard to ensure users array exists
      if (!existingUsers?.users) {
        console.error('Erro: não foi possível obter lista de usuários');
        continue;
      }
      
      // Now TypeScript knows this is an array with email property
      // Fix: Explicitly type the user object from the find method to ensure TypeScript knows it has an email property
      const userExists = existingUsers.users.find((u): u is { email: string } & typeof u => 
        typeof u.email === 'string' && u.email === currentUserEmail
      );
      
      if (userExists) {
        console.log(`Usuário ${currentUserEmail} já existe, pulando...`);
        continue;
      }
      
      // Criar o usuário
      const { data, error } = await supabase.auth.signUp({
        email: currentUserEmail,
        password: user.password,
        options: {
          data: {
            role: user.role
          }
        }
      });
      
      if (error) {
        console.error(`Erro ao criar usuário ${currentUserEmail}:`, error);
        continue;
      }
      
      console.log('Usuário registrado com sucesso:', data);
      
      // Criar perfil
      if (data.user) {
        // Use the proper role type here, constrained to Supabase enum values
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: currentUserEmail,
            name: currentUserEmail.split('@')[0],
            role: user.role // Already typed as 'student' | 'manager' | 'admin'
          });
          
        if (profileError) {
          console.error(`Erro ao criar perfil para ${currentUserEmail}:`, profileError);
        } else {
          console.log(`Usuário e perfil criados com sucesso: ${currentUserEmail}`);
        }
      }
    } catch (error: any) {
      console.error(`Erro ao processar usuário ${currentUserEmail}:`, error);
    }
  }
};

// Função para verificar e consertar perfis de usuários existentes
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
