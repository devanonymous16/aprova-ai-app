
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

/**
 * Testa a conexão com o Supabase e verifica se a tabela de perfis existe
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const testSupabaseConnection = async () => {
  try {
    // Testa conexão básica tentando acessar a tabela profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      
      if (error.code === 'PGRST204') {
        // Table doesn't exist, but connection is working
        return {
          success: true,
          message: 'Conexão bem-sucedida. Tabela profiles não existe.'
        };
      }
      
      return {
        success: false,
        message: `Erro ao conectar: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Conexão bem-sucedida. Tabela profiles já existe.'
    };
  } catch (error: any) {
    console.error('Erro ao testar conexão com Supabase:', error);
    return {
      success: false,
      message: `Erro geral: ${error.message || 'Desconhecido'}`
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
      .select('count')
      .limit(1);
      
    if (error) {
      if (error.code === 'PGRST204') {
        // Table doesn't exist
        toast.error('Tabela de perfis não existe', {
          description: 'É necessário criar manualmente no Console SQL do Supabase'
        });
        return false;
      }
      
      toast.error('Erro ao verificar tabela de perfis', {
        description: error.message
      });
      return false;
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
