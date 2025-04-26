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
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local storage
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth')
      );
      
      supabaseKeys.forEach(key => localStorage.removeItem(key));
      
      // Double-check session is cleared
      const { data: checkSession } = await supabase.auth.getSession();
      if (checkSession.session) {
        localStorage.clear();
      }
      
      // Let onAuthStateChange handle state cleanup and navigation
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
      console.log('[DIAGNÓSTICO] Registrando novo usuário:', email);
      console.log('[DIAGNÓSTICO] Dados de registro:', { 
        name: metadata.name, 
        birth_date: metadata.birth_date, 
        cpf: 'oculto por privacidade'
      });
      
      if (!email || !password) {
        console.error('[DIAGNÓSTICO] Email ou senha ausentes');
        throw new Error('Email e senha são obrigatórios');
      }
      
      // Teste de conexão antes de tentar cadastro
      try {
        const { error: pingError } = await supabase.from('profiles').select('count').limit(1);
        console.log('[DIAGNÓSTICO] Teste de conexão antes do cadastro:', pingError ? 'ERRO' : 'OK');
        if (pingError) {
          console.error('[DIAGNÓSTICO] Erro no teste de conexão:', pingError);
        }
      } catch (pingEx) {
        console.error('[DIAGNÓSTICO] Exceção no teste de conexão:', pingEx);
      }
      
      // 1. Signup com Supabase Auth
      console.log('[DIAGNÓSTICO] Chamando supabase.auth.signUp...');
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
      
      if (error) {
        console.error('[DIAGNÓSTICO] Erro no cadastro:', error);
        console.error('[DIAGNÓSTICO] Detalhes do erro:', { 
          code: error.code, 
          message: error.message,
          status: error.status
        });
        throw error;
      }

      if (!data.user) {
        console.error('[DIAGNÓSTICO] Nenhum usuário retornado após cadastro bem-sucedido');
        throw new Error('Erro ao processar cadastro');
      }

      console.log('[DIAGNÓSTICO] Usuário registrado com sucesso:', data.user.id);
      
      toast.success('Conta criada com sucesso', {
        description: 'Verifique seu email para confirmar o cadastro'
      });
      
      // Redirect to login page after brief delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      console.error('[DIAGNÓSTICO] Erro no cadastro:', error);
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
      
      if (error) {
        console.error('Erro ao enviar email de recuperação:', error);
        throw error;
      }
      
      console.log('Email de recuperação enviado com sucesso');
    } catch (error: any) {
      console.error('Erro no processo de recuperação de senha:', error);
      toast.error('Erro ao enviar email de recuperação', {
        description: error.message || 'Verifique se o email está correto'
      });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    try {
      console.log('Alterando senha...');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Erro ao alterar senha:', error);
        throw error;
      }
      
      console.log('Senha alterada com sucesso');
      toast.success('Senha alterada com sucesso');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro no processo de alteração de senha:', error);
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
