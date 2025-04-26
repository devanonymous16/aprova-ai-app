
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserProfile = async (userId: string, userEmail?: string | null) => {
  try {
    console.log('[DIAGNÓSTICO PERFIL] Iniciando busca de perfil:', { 
      timestamp: new Date().toISOString(),
      userId, 
      userEmail: userEmail || 'não fornecido' 
    });
    
    // Teste de conexão antes de buscar perfil
    try {
      const { error: pingError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      console.log('[DIAGNÓSTICO PERFIL] Teste de conexão:', pingError ? 'ERRO' : 'OK');
      if (pingError) {
        console.error('[DIAGNÓSTICO PERFIL] Erro no teste de conexão:', {
          code: pingError.code,
          message: pingError.message,
          details: pingError.details
        });
      }
    } catch (pingEx) {
      console.error('[DIAGNÓSTICO PERFIL] Exceção no teste de conexão:', pingEx);
    }
    
    console.log('[DIAGNÓSTICO PERFIL] Iniciando select na tabela profiles...');
    const { data, error } = await supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

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
        console.log('[DIAGNÓSTICO PERFIL] Tentando criar perfil padrão...');
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data) {
      console.log('[DIAGNÓSTICO PERFIL] Perfil não encontrado, criando perfil padrão...');
      if (userEmail) {
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    console.log('[DIAGNÓSTICO PERFIL] Perfil encontrado com sucesso:', {
      timestamp: new Date().toISOString(),
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
  console.log('[DIAGNÓSTICO PERFIL] Iniciando criação de perfil padrão:', {
    timestamp: new Date().toISOString(),
    userId,
    email
  });
  
  let defaultRole: UserRole = "student";
  if (email.includes('admin')) defaultRole = "admin";
  else if (email.includes('manager')) defaultRole = "manager";
  
  try {
    console.log('[DIAGNÓSTICO PERFIL] Inserindo perfil com role:', defaultRole);
    
    const profileData = {
      id: userId,
      email,
      name: email.split('@')[0],
      role: defaultRole
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select('role, name, avatar_url')
      .single();
      
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
    
    console.log('[DIAGNÓSTICO PERFIL] Perfil padrão criado com sucesso:', {
      timestamp: new Date().toISOString(),
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

