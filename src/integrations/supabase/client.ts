
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabaseCustomTypes';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.aprova-ai.com';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ';

console.log('[DIAGNÓSTICO] Inicializando cliente Supabase com:', {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY.substring(0, 10) + '...' // Exibir parcialmente por segurança
});

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

// Funções essenciais de autenticação mantidas
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
