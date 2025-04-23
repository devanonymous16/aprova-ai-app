
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabaseCustomTypes';
import { toast } from '@/components/ui/sonner';

const SUPABASE_URL = "https://supabase.aprova-ai.com";
const SUPABASE_PUBLISHABLE_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ";

// Adiciona um timestamp da última verificação de conexão
let lastConnectionCheck = 0;
let isConnected = false;
let connectionAttempts = 0;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    // Aumenta o tempo de timeout para evitar falhas prematuras
    fetch: (url, options) => {
      return fetch(url, { 
        ...options, 
        timeout: 30000,
        cache: 'no-store'
      });
    },
  },
});

// Função para verificar a conexão com o Supabase
export const checkSupabaseConnection = async () => {
  // Evita verificações frequentes demais (no máximo uma a cada 30 segundos)
  const now = Date.now();
  if (now - lastConnectionCheck < 30000 && isConnected) {
    return isConnected;
  }
  
  lastConnectionCheck = now;
  connectionAttempts++;
  
  try {
    console.log(`Verificando conexão com o Supabase (tentativa ${connectionAttempts})...`);
    // Tenta uma operação simples para verificar a conexão
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Erro na conexão com o Supabase:', error.message);
      isConnected = false;
      
      // Se for um erro de rede ou timeout, tenta limpar o cache
      if (error.message.includes('network') || error.message.includes('timeout')) {
        console.log('Tentando limpar cache de conexão');
        await clearSupabaseCache();
      }
      
      return false;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso');
    isConnected = true;
    connectionAttempts = 0;
    return true;
  } catch (err: any) {
    console.error('Exceção ao conectar com Supabase:', err.message);
    isConnected = false;
    
    // Se atingir muitas tentativas, sugere limpar cache
    if (connectionAttempts > 3) {
      console.log('Muitas tentativas falhas, tentando limpar cache');
      await clearSupabaseCache();
    }
    
    return false;
  }
};

// Função para limpar o cache do Supabase
export const clearSupabaseCache = async () => {
  try {
    // Tenta fazer um logout forçado sem atualizar a página
    await supabase.auth.signOut({ scope: 'local' });
    
    console.log('Cache do Supabase limpo');
    
    // Limpa manualmente o localStorage para garantir
    const keysToPreserve: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.includes('supabase')) {
        keysToPreserve.push(key);
      }
    }
    
    const preservedData: Record<string, string> = {};
    keysToPreserve.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) preservedData[key] = value;
    });
    
    localStorage.clear();
    
    // Restaura dados não relacionados ao Supabase
    Object.entries(preservedData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    return true;
  } catch (err) {
    console.error('Erro ao limpar cache:', err);
    return false;
  }
};

// Verifica a conexão inicialmente
checkSupabaseConnection().then(connected => {
  if (!connected) {
    toast.error('Problemas na conexão com o servidor', {
      description: 'Algumas funcionalidades podem estar indisponíveis',
      duration: 5000
    });
  }
});

// Exporta uma função de reconexão para uso em componentes
export const reconnectToSupabase = async () => {
  // Limpa o cache antes de tentar reconectar
  await clearSupabaseCache();
  
  const connected = await checkSupabaseConnection();
  if (connected) {
    toast.success('Conexão com o servidor reestabelecida');
    return true;
  } else {
    toast.error('Falha ao conectar com o servidor', {
      description: 'Tente novamente mais tarde ou recarregue a página'
    });
    return false;
  }
};

// Função para forçar o logout com limpeza de cache
export const forceLogout = async () => {
  try {
    console.log('Forçando logout e limpeza de cache...');
    
    // Primeiro limpa o cache local
    await clearSupabaseCache();
    
    // Depois faz logout global
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout', {
        description: error.message
      });
      return false;
    }
    
    toast.success('Logout realizado com sucesso');
    return true;
  } catch (err: any) {
    console.error('Erro ao forçar logout:', err);
    toast.error('Erro ao fazer logout', {
      description: err.message || 'Erro desconhecido'
    });
    return false;
  }
};
