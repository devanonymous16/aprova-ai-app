
import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { reconnectToSupabase, clearSupabaseCache, supabase } from '@/integrations/supabase/client';

interface UnauthorizedConnectionStatusProps {
  supabaseInfo: any;
  setSupabaseInfo: (info: any) => void;
}

export default function UnauthorizedConnectionStatus({ 
  supabaseInfo,
  setSupabaseInfo
}: UnauthorizedConnectionStatusProps) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const success = await reconnectToSupabase();
      
      if (success) {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        if (!error) {
          setSupabaseInfo({
            connected: true,
            data: data,
            url: "https://supabase.aprova-ai.com",
            status: 'success',
            reconnected: true
          });
        }
      }
    } catch (error) {
      console.error('Erro ao tentar reconectar:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearSupabaseCache();
      toast.success('Cache limpo com sucesso', {
        description: 'Tente reconectar ao Supabase agora'
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache', {
        description: 'Tente recarregar a página'
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  if (supabaseInfo?.status !== 'error') return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-red-600">
        <WifiOff className="h-5 w-5" />
        <span className="font-medium">Problema de conexão com o servidor</span>
      </div>
      <p className="text-sm text-center text-gray-600">
        Não foi possível estabelecer conexão com o Supabase. 
        Isso pode ser por uma instabilidade temporária.
      </p>
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        <Button 
          variant="outline" 
          onClick={handleReconnect} 
          disabled={isReconnecting}
        >
          {isReconnecting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Reconectando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar reconectar
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleClearCache}
          disabled={isClearingCache}
        >
          {isClearingCache ? 'Limpando...' : 'Limpar cache'}
        </Button>
      </div>
    </div>
  );
}
