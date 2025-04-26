import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabaseCustomTypes';

// Obter URL e chave do Supabase das variáveis de ambiente do Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.aprova-ai.com';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ';

console.log('[DIAGNÓSTICO] Inicializando cliente Supabase com:', {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY.substring(0, 10) + '...' // Exibir parcialmente por segurança
});

// Inicializar cliente Supabase com configurações otimizadas para autenticação
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'implicit',
    debug: true
  },
  global: {
    headers: {
      'x-client-info': 'aprova-ai-web'
    }
  },
  db: {
    schema: 'public'
  }
});

// Adicionar uma função explícita para testar se o logout está funcionando
export const testLogout = async () => {
  try {
    console.log('[DIAGNÓSTICO] Testando logout direto do cliente Supabase');
    
    // Verificar sessão antes do logout
    const beforeSession = await supabase.auth.getSession();
    console.log('[DIAGNÓSTICO] Sessão antes do logout:', 
      beforeSession.data.session ? 'Existe' : 'Não existe');
    
    // Realizar logout
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('[DIAGNÓSTICO] Erro no testLogout:', error);
      return { success: false, error };
    }
    
    // Verificar sessão após logout
    const afterSession = await supabase.auth.getSession();
    console.log('[DIAGNÓSTICO] Sessão após logout:', 
      afterSession.data.session ? 'Ainda existe (ERRO)' : 'Removida com sucesso');
    
    return { 
      success: !afterSession.data.session,
      beforeHadSession: !!beforeSession.data.session,
      afterHasSession: !!afterSession.data.session
    };
  } catch (error) {
    console.error('[DIAGNÓSTICO] Exceção no testLogout:', error);
    return { success: false, error };
  }
};

// Testar conexão com Supabase e log detalhado
export const testConnection = async () => {
  try {
    console.log('[DIAGNÓSTICO] Testando conexão com Supabase URL:', SUPABASE_URL);
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[DIAGNÓSTICO] ERRO na conexão Supabase:', error);
      console.error('[DIAGNÓSTICO] Detalhes do erro:', { 
        code: error.code, 
        message: error.message,
        status: error.status,
        name: error.name
      });
      return { success: false, error };
    }
    
    console.log('[DIAGNÓSTICO] Conexão Supabase OK:', !!data.session);
    return { success: true, data };
  } catch (error) {
    console.error('[DIAGNÓSTICO] Exceção na conexão Supabase:', error);
    return { success: false, error };
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    console.log('[DIAGNÓSTICO] Obtendo sessão armazenada...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("[DIAGNÓSTICO] Erro ao obter sessão:", error);
      console.error("[DIAGNÓSTICO] Detalhes do erro:", { 
        code: error.code, 
        message: error.message,
        status: error.status
      });
      throw error;
    }
    console.log('[DIAGNÓSTICO] Sessão recuperada:', data.session ? 'Sessão existe' : 'Sem sessão');
    return { data };
  } catch (error) {
    console.error("[DIAGNÓSTICO] Exceção ao obter sessão:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    console.log('[DIAGNÓSTICO] Obtendo usuário atual...');
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("[DIAGNÓSTICO] Erro ao obter usuário:", error);
      console.error("[DIAGNÓSTICO] Detalhes do erro:", { 
        code: error.code, 
        message: error.message,
        status: error.status
      });
      throw error;
    }
    console.log('[DIAGNÓSTICO] Usuário recuperado:', data?.user?.email || 'Nenhum usuário');
    return data?.user;
  } catch (error) {
    console.error("[DIAGNÓSTICO] Exceção ao obter usuário:", error);
    throw error;
  }
};

// Exportando as funções existentes
export { testSupabaseConnection } from '@/utils/supabaseSetup';

// Add connection test function with timeout
export const testSupabaseConnection = async () => {
  try {
    console.log('[DIAGNÓSTICO] Testando conexão com timeout...');
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout na conexão')), 5000);
    });
    
    const connectionPromise = supabase.auth.getSession();
    
    const result = await Promise.race([connectionPromise, timeoutPromise]);
    console.log('[DIAGNÓSTICO] Teste de conexão OK:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('[DIAGNÓSTICO] Erro no teste de conexão:', error);
    return { success: false, error };
  }
};

// Chamar teste de conexão automaticamente na inicialização 
// para verificar se a configuração está correta
testConnection().then(result => {
  console.log('[DIAGNÓSTICO] Teste de conexão inicial:', result.success ? 'OK' : 'FALHOU');
});
