
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

export const useRetryMechanism = (
  user: User | null,
  profile: any | null,
  updateProfile: (user: User) => Promise<void>
) => {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleRetry = useCallback(() => {
    if (user && !profile && retryCount < maxRetries) {
      console.log(`Tentativa ${retryCount + 1} de carregar perfil...`);
      const delay = Math.pow(2, retryCount) * 2000;
      
      const retryTimer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        updateProfile(user);
      }, delay);
      
      return () => clearTimeout(retryTimer);
    }
    
    if (user && !profile && retryCount >= maxRetries) {
      toast.error('Não foi possível carregar seu perfil', {
        description: 'Tente recarregar a página ou verificar sua conexão'
      });
    }
  }, [user, profile, retryCount, maxRetries, updateProfile]);

  return { retryCount, handleRetry };
};
