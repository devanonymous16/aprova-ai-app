
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabaseCustomTypes';

// Credenciais do Supabase - definidas diretamente para evitar erros com process.env
const SUPABASE_URL = import.meta.env.SUPABASE_URL || "https://supabase.aprova-ai.com";
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ";

console.log('Initializing Supabase client with:', {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY ? 'Key exists (not showing for security)' : 'Key missing'
});

// Cliente do Supabase com configurações atualizadas
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'implicit' // Adicionado para melhor compatibilidade
  },
  global: {
    headers: {
      'x-client-info': 'aprova-ai-web'
    }
  }
});

// Função para verificar estado da sessão atual
export const getCurrentSession = async () => {
  try {
    console.log('Getting stored session...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Erro ao obter sessão:", error);
      throw error;
    }
    console.log('Session retrieved:', data.session ? 'Session exists' : 'No session');
    return { data };
  } catch (error) {
    console.error("Exceção ao obter sessão:", error);
    throw error;
  }
};

// Função para verificar usuário atual
export const getCurrentUser = async () => {
  try {
    console.log('Getting current user...');
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Erro ao obter usuário:", error);
      throw error;
    }
    console.log('User retrieved:', data?.user?.email || 'No user');
    return data?.user;
  } catch (error) {
    console.error("Exceção ao obter usuário:", error);
    throw error;
  }
};

// Função para testar explicitamente a conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('Testando conexão com Supabase URL:', SUPABASE_URL);
    
    // Primeiro, tentamos uma operação simples de autenticação
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Erro na autenticação:', authError);
      return {
        success: false,
        message: `Erro na autenticação: ${authError.message}`,
        details: authError
      };
    }
    
    console.log('Autenticação bem-sucedida:', authData);
    
    // Agora tentamos acessar uma tabela para confirmar o acesso ao banco de dados
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erro ao acessar tabela profiles:', error);
      
      // Verifica se o erro é de permissão ou de tabela inexistente
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'A tabela profiles não existe. É necessário criar a tabela.',
          details: error
        };
      } else if (error.code === 'PGRST204') {
        // Se o erro for PGRST204, a tabela existe mas está vazia ou temos permissão
        return {
          success: true,
          message: 'Conexão bem-sucedida. Tabela profiles existe mas pode estar vazia.',
          details: error
        };
      } else {
        return {
          success: false,
          message: `Erro ao acessar dados: ${error.message}`,
          details: error
        };
      }
    }
    
    // Se chegou aqui, a conexão foi bem-sucedida
    return {
      success: true,
      message: 'Conexão bem-sucedida com o Supabase',
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
