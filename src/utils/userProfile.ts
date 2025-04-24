
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserProfile = async (userId: string, userEmail?: string | null) => {
  try {
    console.log('[DIAGNÓSTICO] Buscando perfil para usuário:', userId, 'email:', userEmail || 'não fornecido');
    
    // Teste de conexão antes de buscar perfil
    try {
      const { error: pingError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      console.log('[DIAGNÓSTICO] Teste de conexão antes de buscar perfil:', pingError ? 'ERRO' : 'OK');
      if (pingError) {
        console.error('[DIAGNÓSTICO] Erro no teste de conexão:', pingError);
      }
    } catch (pingEx) {
      console.error('[DIAGNÓSTICO] Exceção no teste de conexão:', pingEx);
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[DIAGNÓSTICO] Erro ao buscar perfil:', error);
      console.error('[DIAGNÓSTICO] Detalhes do erro:', { 
        code: error.code, 
        message: error.message,
        hint: error.hint || 'Sem dica',
        details: error.details || 'Sem detalhes'
      });
      
      if (userEmail) {
        console.log('[DIAGNÓSTICO] Perfil não encontrado, criando perfil padrão');
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    if (!data) {
      console.log('[DIAGNÓSTICO] Perfil não encontrado, criando perfil padrão');
      if (userEmail) {
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    console.log('[DIAGNÓSTICO] Perfil encontrado:', data);
    return data;
  } catch (error) {
    console.error('[DIAGNÓSTICO] Erro em fetchUserProfile:', error);
    return null;
  }
};

export const createDefaultProfile = async (userId: string, email: string) => {
  console.log('[DIAGNÓSTICO] Criando perfil padrão para:', userId, 'com email:', email);
  
  let defaultRole: UserRole = 'student';
  if (email.includes('admin')) defaultRole = 'admin';
  else if (email.includes('manager')) defaultRole = 'manager';
  
  try {
    console.log('[DIAGNÓSTICO] Papel padrão atribuído com base no padrão de email:', defaultRole);
    
    const profileData = {
      id: userId,
      email,
      name: email.split('@')[0],
      role: defaultRole
    };
    
    console.log('[DIAGNÓSTICO] Dados do perfil para inserir:', profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select('role, name, avatar_url')
      .single();
      
    if (error) {
      console.error('[DIAGNÓSTICO] Erro ao criar perfil padrão:', error);
      console.error('[DIAGNÓSTICO] Detalhes do erro:', { 
        code: error.code, 
        message: error.message,
        hint: error.hint || 'Sem dica',
        details: error.details || 'Sem detalhes'
      });
      return null;
    }
    
    console.log('[DIAGNÓSTICO] Perfil padrão criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('[DIAGNÓSTICO] Erro em createDefaultProfile:', error);
    return null;
  }
};
