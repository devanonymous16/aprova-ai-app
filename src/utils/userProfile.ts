import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserProfile = async (userId: string, userEmail?: string | null) => {
  const startTime = new Date();
  console.log('[PROFILE DEBUG] fetchUserProfile iniciando:', {
    timestamp: startTime.toISOString(),
    userId,
    email: userEmail || 'não fornecido'
  });
  
  try {
    // Log pre-query
    console.log('[PROFILE DEBUG] Iniciando query profiles...', {
      timestamp: new Date().toISOString(),
      action: 'PRE_QUERY'
    });
    
    // Execute query with timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 10000);
    });
    
    const queryPromise = supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    // Log immediate query result
    console.log('[PROFILE DEBUG] Resultado direto da query:', {
      timestamp: new Date().toISOString(),
      hasData: !!data,
      hasError: !!error,
      data,
      error
    });

    if (error) {
      console.error('[PROFILE DEBUG] Erro na query:', {
        timestamp: new Date().toISOString(),
        error
      });
      
      if (userEmail) {
        console.log('[PROFILE DEBUG] Tentando criar perfil após erro');
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data) {
      console.log('[PROFILE DEBUG] Perfil não encontrado, tentando criar');
      if (userEmail) {
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    console.log('[PROFILE DEBUG] Perfil encontrado com sucesso:', {
      timestamp: new Date().toISOString(),
      profile: data
    });
    
    return data;
    
  } catch (error) {
    console.error('[PROFILE DEBUG] Erro crítico em fetchUserProfile:', {
      timestamp: new Date().toISOString(),
      error
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
