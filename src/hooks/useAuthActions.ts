
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Login realizado com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Erro no login', {
        description: error.message || 'Verifique suas credenciais'
      });
      throw error;
    }
  }, [navigate]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error('Erro no login com Google', {
        description: error.message || 'Tente novamente mais tarde'
      });
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error('Erro no login com Apple', {
        description: error.message || 'Tente novamente mais tarde'
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro no logout');
    }
  }, [navigate]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata: { 
      name: string;
      cpf: string;
      birth_date: string;
    }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            cpf: metadata.cpf,
            birth_date: metadata.birth_date,
            role: 'student'
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Conta criada com sucesso');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Erro no cadastro', {
        description: error.message || 'Não foi possível criar a conta'
      });
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error('Erro ao enviar email de recuperação', {
        description: error.message || 'Verifique se o email está correto'
      });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Senha alterada com sucesso');
      navigate('/login');
    } catch (error: any) {
      toast.error('Erro ao alterar senha', {
        description: error.message || 'Por favor, tente novamente ou solicite um novo link'
      });
      throw error;
    }
  }, [navigate]);

  return {
    login,
    loginWithGoogle,
    loginWithApple,
    logout,
    signUp,
    forgotPassword,
    resetPassword
  };
};
