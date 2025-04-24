
import { useState } from 'react';
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useConnectionState = () => {
  const [connectionError, setConnectionError] = useState(false);

  const checkConnection = async () => {
    const isConnected = await checkSupabaseConnection();
    setConnectionError(!isConnected);
    return isConnected;
  };

  const startPeriodicCheck = (interval: number = 30000) => {
    const checkId = setInterval(async () => {
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        setConnectionError(false);
        clearInterval(checkId);
      }
    }, interval);

    return () => clearInterval(checkId);
  };

  return { connectionError, setConnectionError, checkConnection, startPeriodicCheck };
};
