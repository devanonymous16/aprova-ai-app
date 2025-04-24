
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

/**
 * Testa a conexão com o Supabase e verifica se a tabela de perfis existe
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('Testando conexão com Supabase...');
    
    // Teste inicial para ver se conseguimos fazer qualquer requisição
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Erro ao verificar sessão:', sessionError);
      return {
        success: false,
        message: `Erro na autenticação: ${sessionError.message}`
      };
    }

    console.log('Verificação de sessão bem-sucedida:', sessionData);
    
    // Testa conexão básica tentando acessar a tabela profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        // Table doesn't exist, but connection is working
        return {
          success: true,
          message: 'Conexão bem-sucedida. Tabela profiles não existe.'
        };
      } else if (error.code === 'PGRST204') {
        // This means the table exists but no rows were found
        return {
          success: true,
          message: 'Conexão bem-sucedida. Tabela profiles existe mas não tem registros.'
        };
      }
      
      return {
        success: false,
        message: `Erro ao acessar dados: ${error.message}`,
        details: error
      };
    }
    
    return {
      success: true,
      message: `Conexão bem-sucedida. Tabela profiles já existe com ${data.length} registro(s).`,
      details: data
    };
  } catch (error: any) {
    console.error('Erro ao testar conexão com Supabase:', error);
    return {
      success: false,
      message: `Erro geral: ${error.message || 'Desconhecido'}`,
      details: error
    };
  }
};

/**
 * Verifica se a tabela de perfis existe no Supabase
 */
export const setupProfilesTable = async () => {
  try {
    // Verificar se a tabela existe tentando selecionar dados dela
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        // Table doesn't exist
        toast.error('Tabela de perfis não existe', {
          description: 'É necessário criar manualmente no Console SQL do Supabase'
        });
        return false;
      } else if (error.code === 'PGRST204') {
        // This means the table exists but no rows were found
        toast.success('Tabela de perfis existe mas está vazia');
        return true;
      } else {
        toast.error('Erro ao verificar tabela de perfis', {
          description: error.message
        });
        return false;
      }
    }
    
    toast.success('Tabela de perfis já existe');
    return true;
  } catch (error: any) {
    toast.error('Erro ao verificar tabela de perfis', {
      description: error.message || 'Erro desconhecido'
    });
    return false;
  }
};

/**
 * Verifica se há um usuário autenticado e seu perfil
 */
export const checkAuthAndProfile = async () => {
  try {
    // 1. Verificar autenticação
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return {
        success: false, 
        message: `Erro ao verificar autenticação: ${sessionError.message}`
      };
    }
    
    if (!sessionData.session) {
      return { 
        success: false, 
        message: 'Nenhum usuário autenticado' 
      };
    }
    
    // 2. Verificar perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();
      
    if (profileError) {
      if (profileError.code === 'PGRST204') {
        return {
          success: false,
          message: 'Usuário autenticado, mas perfil não encontrado',
          user: sessionData.session.user
        };
      }
      
      return {
        success: false, 
        message: `Erro ao buscar perfil: ${profileError.message}`,
        user: sessionData.session.user
      };
    }
    
    return {
      success: true,
      message: 'Usuário autenticado com perfil',
      user: sessionData.session.user,
      profile: profileData
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro: ${error.message || 'Erro desconhecido'}`
    };
  }
};
