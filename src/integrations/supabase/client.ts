
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabaseCustomTypes';

// Credenciais do Supabase
const SUPABASE_URL = "https://supabase.aprova-ai.com";
const SUPABASE_PUBLISHABLE_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ";

// Cliente do Supabase com configurações atualizadas
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true // Importante para autenticar após OAuth redirects
  }
});

// Função para verificar estado da sessão atual
export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
};

// Função para verificar usuário atual
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};
