
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login para:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }
      
      console.log('Login bem-sucedido:', data);
      toast.success('Login realizado com sucesso');
      
      // Redirect directly to dashboard without delay - will let auth context handle proper redirection
      navigate('/dashboard', { replace: true });
      
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
      console.log('Iniciando login com Google');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      toast.error('Erro no login com Google', {
        description: error.message || 'Tente novamente mais tarde'
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Fazendo logout');
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast.error('Erro no logout', {
        description: error.message || 'Tente novamente mais tarde'
      });
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
      console.log('Iniciando cadastro para:', email);
      
      // 1. Signup with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            cpf: metadata.cpf,
            birth_date: metadata.birth_date,
            role: 'student'  // Default role for all signed up users
          }
        }
      });
      
      if (error) {
        console.error('Erro no cadastro (auth):', error);
        throw error;
      }

      console.log('Cadastro de auth bem-sucedido:', data);
      
      // 2. Create profile record in profiles table
      if (data.user) {
        console.log('Criando registro de perfil para:', data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: metadata.name,
            role: 'student', // Always student for signup via platform
            birth_date: metadata.birth_date,
            cpf: metadata.cpf
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          toast.error('Erro ao criar perfil', { 
            description: profileError.message 
          });
          
          // Continue even with profile error - we'll try to create it later
        } else {
          console.log('Perfil criado com sucesso');
        }
      }
      
      toast.success('Conta criada com sucesso', {
        description: 'Você será redirecionado para a página de login'
      });
      
      // 3. Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro no cadastro', {
        description: error.message || 'Não foi possível criar a conta'
      });
      throw error;
    }
  }, [navigate]);

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

  return {
    login,
    loginWithGoogle,
    logout,
    signUp,
    forgotPassword,
    resetPassword
  };
};
