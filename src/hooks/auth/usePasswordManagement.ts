
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const usePasswordManagement = () => {
  const navigate = useNavigate();

  const forgotPassword = useCallback(async (email: string) => {
    try {
      console.log('Enviando email de recuperação para:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      console.log('Email de recuperação enviado com sucesso');
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      toast.error('Erro ao enviar email de recuperação', {
        description: error.message || 'Verifique se o email está correto'
      });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    try {
      console.log('Tentando alterar senha');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      console.log('Senha alterada com sucesso');
      toast.success('Senha alterada com sucesso');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha', {
        description: error.message || 'Por favor, tente novamente ou solicite um novo link'
      });
      throw error;
    }
  }, [navigate]);

  return { forgotPassword, resetPassword };
};
