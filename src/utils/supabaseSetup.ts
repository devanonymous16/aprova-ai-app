
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
    // Testa conexão básica consultando informações do schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return {
        success: false,
        message: `Erro ao conectar: ${error.message}`
      };
    }
    
    // Verifica se a tabela profiles existe
    const { data: profileData, error: profileError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .maybeSingle();
    
    if (profileError) {
      console.error('Erro ao verificar tabela profiles:', profileError);
      return {
        success: false,
        message: `Erro ao verificar tabela: ${profileError.message}`
      };
    }
    
    if (!profileData) {
      return {
        success: true,
        message: 'Conexão bem-sucedida. Tabela profiles não existe.'
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
    // Verificar se a tabela existe
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .maybeSingle();
      
    if (error) {
      toast.error('Erro ao verificar tabela de perfis', {
        description: error.message
      });
      return false;
    }
    
    if (data?.table_name) {
      toast.success('Tabela de perfis já existe');
      return true;
    } else {
      toast.error('Tabela de perfis não existe', {
        description: 'É necessário criar manualmente no Console SQL do Supabase'
      });
      return false;
    }
  } catch (error: any) {
    toast.error('Erro ao verificar tabela de perfis', {
      description: error.message || 'Erro desconhecido'
    });
    return false;
  }
};
