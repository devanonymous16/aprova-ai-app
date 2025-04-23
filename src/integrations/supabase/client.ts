
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/utils/supabaseCustomTypes';
import { toast } from '@/components/ui/sonner';

const SUPABASE_URL = "https://supabase.aprova-ai.com";
const SUPABASE_PUBLISHABLE_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ";

// Adiciona um timestamp da última verificação de conexão
let lastConnectionCheck = 0;
let isConnected = false;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Aumenta o tempo de timeout para evitar falhas prematuras
    fetch: (url, options) => {
      return fetch(url, { ...options, timeout: 30000 });
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
  
  try {
    console.log('Verificando conexão com o Supabase...');
    // Tenta uma operação simples para verificar a conexão
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Erro na conexão com o Supabase:', error.message);
      isConnected = false;
      return false;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso');
    isConnected = true;
    return true;
  } catch (err: any) {
    console.error('Exceção ao conectar com Supabase:', err.message);
    isConnected = false;
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
  const connected = await checkSupabaseConnection();
  if (connected) {
    toast.success('Conexão com o servidor reestabelecida');
    return true;
  } else {
    toast.error('Falha ao conectar com o servidor', {
      description: 'Tente novamente mais tarde'
    });
    return false;
  }
};
