import { useCallback } from 'react';
import { supabase, checkSupabaseConnection, forceLogout } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login para:', email);
      
      // Verifica conexão antes de tentar login
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
        
        // Mensagens de erro personalizadas
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
      
      // Redirect directly to dashboard without delay - will let auth context handle proper redirection
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('Login error:', error);
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
      console.log('Fazendo logout normal');
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        
        // Se houver erro, tenta o logout forçado
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
      
      // Limpa dados adicionais do localStorage
      try {
        localStorage.removeItem('supabase.auth.token');
      } catch (e) {
        console.log('Erro ao limpar localStorage:', e);
      }
      
      // Sempre navega para login após logout, independente do resultado
      navigate('/login', { replace: true });
      return true;
    } catch (error: any) {
      console.error('Erro no logout:', error);
      
      // Se houver exceção, tenta o logout forçado
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
