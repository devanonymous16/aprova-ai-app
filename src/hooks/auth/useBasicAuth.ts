
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, checkSupabaseConnection, forceLogout } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useBasicAuth = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login para:', email);
      
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast.error('Erro de conexão com o servidor', {
          description: 'Verifique sua conexão de internet e tente novamente'
        });
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Erro no login:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciais inválidas', {
            description: 'Email ou senha incorretos'
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email não confirmado', {
            description: 'Verifique seu email para confirmar sua conta'
          });
        } else {
          toast.error('Erro no login', {
            description: error.message || 'Verifique suas credenciais'
          });
        }
        throw error;
      }
      
      console.log('Login bem-sucedido:', data);
      toast.success('Login realizado com sucesso');
      
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      console.log('Fazendo logout normal');
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        console.log('Tentando logout forçado após erro');
        const forceSuccess = await forceLogout();
        
        if (!forceSuccess) {
          toast.error('Erro ao fazer logout', {
            description: 'Tente recarregar a página e tentar novamente'
          });
          return false;
        }
      } else {
        toast.success('Logout realizado com sucesso');
      }
      
      try {
        localStorage.removeItem('supabase.auth.token');
      } catch (e) {
        console.log('Erro ao limpar localStorage:', e);
      }
      
      navigate('/login', { replace: true });
      return true;
    } catch (error: any) {
      console.error('Erro no logout:', error);
      
      console.log('Tentando logout forçado após exceção');
      const forceSuccess = await forceLogout();
      
      if (forceSuccess) {
        navigate('/login', { replace: true });
        return true;
      }
      
      toast.error('Erro no logout', {
        description: 'Por favor, recarregue a página e tente novamente'
      });
      return false;
    }
  }, [navigate]);

  return { login, logout };
};
