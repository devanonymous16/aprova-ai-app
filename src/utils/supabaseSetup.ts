
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

/**
 * Testa a conexão com o Supabase e verifica se a tabela de perfis existe
 * @returns {Promise<{success: boolean, message: string, details?: any}>}
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
        message: `Erro na autenticação: ${sessionError.message}`,
        details: sessionError
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
          message: 'Conexão bem-sucedida. Tabela profiles não existe.',
          details: error
        };
      } else if (error.code === 'PGRST204') {
        // This means the table exists but no rows were found
        return {
          success: true,
          message: 'Conexão bem-sucedida. Tabela profiles existe mas não tem registros.',
          details: error
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
 * @returns {Promise<boolean>}
 */
export const setupProfilesTable = async () => {
  try {
    console.log('Verificando tabela de perfis...');
    // Verificar se a tabela existe tentando selecionar dados dela
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Erro ao verificar tabela:', error);
      
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
    console.error('Erro ao verificar tabela de perfis:', error);
    toast.error('Erro ao verificar tabela de perfis', {
      description: error.message || 'Erro desconhecido'
    });
    return false;
  }
};

/**
 * Verifica se há um usuário autenticado e seu perfil
 * @returns {Promise<{success: boolean, message: string, user?: any, profile?: any}>}
 */
export const checkAuthAndProfile = async () => {
  try {
    console.log('Verificando autenticação e perfil...');
    // 1. Verificar autenticação
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Erro ao verificar autenticação:', sessionError);
      return {
        success: false, 
        message: `Erro ao verificar autenticação: ${sessionError.message}`
      };
    }
    
    if (!sessionData.session) {
      console.log('Nenhum usuário autenticado');
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
      console.error('Erro ao buscar perfil:', profileError);
      
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
    
    console.log('Perfil encontrado:', profileData);
    return {
      success: true,
      message: 'Usuário autenticado com perfil',
      user: sessionData.session.user,
      profile: profileData
    };
  } catch (error: any) {
    console.error('Erro ao verificar autenticação e perfil:', error);
    return {
      success: false,
      message: `Erro: ${error.message || 'Erro desconhecido'}`
    };
  }
};

/**
 * Cria a tabela de profiles no Supabase se ela não existir
 * @returns {Promise<boolean>}
 */
export const createProfilesTable = async () => {
  try {
    console.log('Tentando criar tabela de perfis...');
    
    // Verificar primeiro se a tabela já existe
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    // Se não der erro de tabela não existente, então a tabela já existe
    if (!checkError || checkError.code !== '42P01') {
      console.log('Tabela de perfis já existe');
      return true;
    }
    
    // Criar a tabela usando SQL via RPC
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'student',
          avatar_url TEXT,
          birth_date DATE,
          cpf TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Configurar RLS para a tabela profiles
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas de RLS
        CREATE POLICY "Usuários podem ver seus próprios perfis"
          ON public.profiles FOR SELECT
          USING (auth.uid() = id);
          
        CREATE POLICY "Usuários podem atualizar seus próprios perfis"
          ON public.profiles FOR UPDATE
          USING (auth.uid() = id);
          
        CREATE POLICY "Perfis de usuários novos podem ser criados"
          ON public.profiles FOR INSERT
          WITH CHECK (true);
      `
    });
    
    if (error) {
      console.error('Erro ao criar tabela de perfis:', error);
      toast.error('Erro ao criar tabela de perfis', {
        description: error.message
      });
      return false;
    }
    
    console.log('Tabela de perfis criada com sucesso');
    toast.success('Tabela de perfis criada com sucesso');
    return true;
  } catch (error: any) {
    console.error('Erro ao criar tabela de perfis:', error);
    toast.error('Erro ao criar tabela de perfis', {
      description: error.message || 'Erro desconhecido'
    });
    return false;
  }
};
