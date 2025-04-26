import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserProfile = async (userId: string, userEmail?: string | null) => {
  console.log('[PROFILE DEBUG] fetchUserProfile INICIANDO:', {
    userId,
    userEmail,
    timestamp: new Date().toISOString(),
    supabaseInitialized: !!supabase
  });

  try {
    console.log('[PROFILE DEBUG] Iniciando query Supabase...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    
    console.log('[PROFILE DEBUG] Resultado da query:', {
      success: !error,
      hasData: !!data,
      error: error?.message,
      data: data ? {
        id: data.id,
        role: data.role,
        name: data.name
      } : null
    });
    
    if (error) {
      console.error('[PROFILE DEBUG] Erro na query:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      if (userEmail) {
        console.log('[PROFILE DEBUG] Tentando criar perfil padrão...');
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data && userEmail) {
      console.log('[PROFILE DEBUG] Perfil não encontrado, criando padrão...');
      return await createDefaultProfile(userId, userEmail);
    }

    if (!data) {
      console.log('[PROFILE DEBUG] Nenhum perfil encontrado e sem email para criar');
      return null;
    }
    
    console.log('[PROFILE DEBUG] Perfil recuperado com sucesso:', {
      id: data.id,
      role: data.role,
      name: data.name
    });
    
    return data;
    
  } catch (error: any) {
    console.error('[PROFILE DEBUG] Erro crítico em fetchUserProfile:', {
      error,
      errorMessage: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return null;
  }
};

export const createDefaultProfile = async (userId: string, email: string) => {
  const startTime = new Date();
  console.log('[PROFILE DEBUG] Iniciando criação de perfil padrão:', {
    timestamp: startTime.toISOString(),
    userId,
    email
  });
  
  let defaultRole: UserRole = "student";
  if (email.includes('admin')) defaultRole = "admin";
  else if (email.includes('manager')) defaultRole = "manager";
  
  try {
    console.log('[PROFILE DEBUG] Inserindo perfil com role:', defaultRole, {
      timestamp: new Date().toISOString()
    });
    
    const profileData = {
      id: userId,
      email,
      name: email.split('@')[0],
      role: defaultRole
    };
    
    const createStart = new Date();
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select('role, name, avatar_url')
      .single();
    const createEnd = new Date();
      
    console.log('[PROFILE DEBUG] Tentativa de criação concluída:', {
      timestamp: createEnd.toISOString(),
      duration: createEnd.getTime() - createStart.getTime() + 'ms',
      success: !error,
      hasData: !!data
    });
      
    if (error) {
      console.error('[PROFILE DEBUG] Erro ao criar perfil padrão:', {
        timestamp: new Date().toISOString(),
        error: {
          code: error.code,
          message: error.message
        }
      });
      return null;
    }
    
    const endTime = new Date();
    console.log('[PROFILE DEBUG] Perfil padrão criado com sucesso:', {
      timestamp: endTime.toISOString(),
      totalDuration: endTime.getTime() - startTime.getTime() + 'ms',
      data
    });
    return data;
  } catch (error) {
    console.error('[PROFILE DEBUG] Erro crítico em createDefaultProfile:', {
      timestamp: new Date().toISOString(),
      error
    });
    return null;
  }
};
