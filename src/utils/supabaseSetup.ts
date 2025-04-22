
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// SQL para criação da tabela de perfis
const CREATE_PROFILES_TABLE = `
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'manager', 'admin')),
  avatar_url TEXT,
  birth_date TEXT,
  cpf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar políticas de RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler perfis" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que usuários atualizem seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para permitir que admins atualizem qualquer perfil
CREATE POLICY "Admins podem atualizar qualquer perfil" ON public.profiles
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
`;

/**
 * Testa a conexão com o Supabase e verifica se a tabela de perfis existe
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const testSupabaseConnection = async () => {
  try {
    // Testa conexão básica
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_service_status');
    
    if (rpcError) {
      console.error('Erro ao conectar com o Supabase:', rpcError);
      return {
        success: false,
        message: `Erro ao conectar: ${rpcError.message}`
      };
    }
    
    // Verifica se a tabela profiles existe
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('count()')
      .limit(1);
    
    if (profileError && profileError.code === '42P01') {
      console.log('Tabela profiles não existe. Tentando criar...');
      
      // Cria a tabela profiles
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql_query: CREATE_PROFILES_TABLE
      });
      
      if (sqlError) {
        console.error('Erro ao criar tabela profiles:', sqlError);
        return {
          success: false,
          message: `Erro ao criar tabela: ${sqlError.message}`
        };
      }
      
      return {
        success: true,
        message: 'Conexão bem-sucedida. Tabela profiles criada.'
      };
    }
    
    if (profileError) {
      console.error('Erro ao verificar tabela profiles:', profileError);
      return {
        success: false,
        message: `Erro ao verificar tabela: ${profileError.message}`
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
 * Cria a tabela de perfis no Supabase
 */
export const setupProfilesTable = async () => {
  try {
    // Cria a tabela profiles
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: CREATE_PROFILES_TABLE
    });
    
    if (error) {
      toast.error('Erro ao criar tabela de perfis', {
        description: error.message
      });
      return false;
    }
    
    toast.success('Tabela de perfis criada com sucesso');
    return true;
  } catch (error: any) {
    toast.error('Erro ao configurar banco de dados', {
      description: error.message || 'Erro desconhecido'
    });
    return false;
  }
};
