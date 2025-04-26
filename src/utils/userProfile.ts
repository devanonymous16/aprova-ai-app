import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserProfile = async (userId: string, userEmail?: string | null) => {
  const startTime = new Date();
  try {
    console.log('[DIAGNÓSTICO PERFIL] Iniciando busca de perfil:', { 
      timestamp: startTime.toISOString(),
      userId, 
      userEmail: userEmail || 'não fornecido' 
    });
    
    console.log('[DIAGNÓSTICO PERFIL] Iniciando select na tabela profiles...', {
      timestamp: new Date().toISOString()
    });
    
    const queryStart = new Date();
    const { data, error } = await supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    const queryEnd = new Date();
    
    console.log('[DIAGNÓSTICO PERFIL] Query profiles concluída:', {
      timestamp: queryEnd.toISOString(),
      duration: queryEnd.getTime() - queryStart.getTime() + 'ms',
      hasData: !!data,
      hasError: !!error
    });

    if (error) {
      console.error('[DIAGNÓSTICO PERFIL] Erro ao buscar perfil:', {
        timestamp: new Date().toISOString(),
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
      
      if (userEmail) {
        console.log('[DIAGNÓSTICO PERFIL] Tentando criar perfil padrão...', {
          timestamp: new Date().toISOString()
        });
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data) {
      console.log('[DIAGNÓSTICO PERFIL] Perfil não encontrado, tentando criar perfil padrão...', {
        timestamp: new Date().toISOString()
      });
      if (userEmail) {
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    const endTime = new Date();
    console.log('[DIAGNÓSTICO PERFIL] Perfil encontrado com sucesso:', {
      timestamp: endTime.toISOString(),
      totalDuration: endTime.getTime() - startTime.getTime() + 'ms',
      data
    });
    return data;
  } catch (error) {
    console.error('[DIAGNÓSTICO PERFIL] Erro crítico em fetchUserProfile:', {
      timestamp: new Date().toISOString(),
      error
    });
    return null;
  }
};

export const createDefaultProfile = async (userId: string, email: string) => {
  const startTime = new Date();
  console.log('[DIAGNÓSTICO PERFIL] Iniciando criação de perfil padrão:', {
    timestamp: startTime.toISOString(),
    userId,
    email
  });
  
  let defaultRole: UserRole = "student";
  if (email.includes('admin')) defaultRole = "admin";
  else if (email.includes('manager')) defaultRole = "manager";
  
  try {
    console.log('[DIAGNÓSTICO PERFIL] Inserindo perfil com role:', defaultRole, {
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
      
    console.log('[DIAGNÓSTICO PERFIL] Tentativa de criação concluída:', {
      timestamp: createEnd.toISOString(),
      duration: createEnd.getTime() - createStart.getTime() + 'ms',
      success: !error,
      hasData: !!data
    });
      
    if (error) {
      console.error('[DIAGNÓSTICO PERFIL] Erro ao criar perfil padrão:', {
        timestamp: new Date().toISOString(),
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
      return null;
    }
    
    const endTime = new Date();
    console.log('[DIAGNÓSTICO PERFIL] Perfil padrão criado com sucesso:', {
      timestamp: endTime.toISOString(),
      totalDuration: endTime.getTime() - startTime.getTime() + 'ms',
      data
    });
    return data;
  } catch (error) {
    console.error('[DIAGNÓSTICO PERFIL] Erro crítico em createDefaultProfile:', {
      timestamp: new Date().toISOString(),
      error
    });
    return null;
  }
};
