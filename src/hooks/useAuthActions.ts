
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos');
        }
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Erro ao processar login: usuário não encontrado');
      }
      
      toast.success('Login realizado com sucesso');
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error('Erro no login com Google', {
        description: error.message || 'Tente novamente mais tarde'
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local storage
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth')
      );
      
      supabaseKeys.forEach(key => localStorage.removeItem(key));
      
      // The SIGNED_OUT event in onAuthStateChange will handle state cleanup
      toast.success('Logout realizado com sucesso');
      
      // Force navigation on success - this ensures we navigate even if the event doesn't fire
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout', {
        description: error.message || 'Tente novamente'
      });
      // Force navigation on error
      window.location.href = '/login';
    }
  }, []);

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
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            cpf: metadata.cpf,
            birth_date: metadata.birth_date,
            role: 'student'  // Papel padrão para todos os usuários cadastrados
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;

      if (!data.user) {
        throw new Error('Erro ao processar cadastro');
      }
      
      toast.success('Conta criada com sucesso', {
        description: 'Verifique seu email para confirmar o cadastro'
      });
      
      // Redirect to login page after brief delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Erro no cadastro', {
        description: error.message || 'Não foi possível criar a conta'
      });
      throw error;
    }
  }, [navigate]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Email de recuperação enviado', {
        description: 'Verifique sua caixa de entrada'
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
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
      console.error('Password update error:', error);
      toast.error('Erro ao alterar senha', {
        description: error.message || 'Por favor, tente novamente ou solicite um novo link'
      });
      throw error;
    }
  }, [navigate]);

  return {
    login,
    loginWithGoogle,
    logout,
    signUp,
    forgotPassword,
    resetPassword
  };
};
