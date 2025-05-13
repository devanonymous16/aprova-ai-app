// src/hooks/useAuthActions.ts

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner'; // Usando sonner para toasts
// import { AuthUser, AuthError, UserResponse, SessionResponse } from '@supabase/supabase-js'; // Tipos mais específicos se necessário

interface SignUpOptions {
  data?: Record<string, any>;
  emailRedirectTo?: string;
}

// Para tipar o retorno de signUp se você retornar data
// interface SignUpData {
//   user: AuthUser | null;
//   session: Session | null;
// }

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) /*: Promise<AuthUser | undefined>*/ => {
    console.log('[login] Iniciando login com email:', email);
    const toastId = 'login-toast'; // Para gerenciar o toast
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      console.log('[login] Chamando supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('[login] Erro retornado pelo Supabase:', error.message, error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha inválidos', { id: toastId });
        } else {
          toast.error('Erro no login', { id: toastId, description: error.message });
        }
        throw error; 
      }
      
      if (!data.user) {
        console.error('[login] Login sem erro, mas sem usuário retornado do Supabase.');
        const err = new Error('Erro ao processar login: resposta inesperada do servidor.');
        toast.error('Erro no login', { id: toastId, description: err.message });
        throw err;
      }
      
      console.log('[login] Login bem-sucedido para:', data.user.email);
      toast.success('Login realizado com sucesso!', { id: toastId });
      // return data.user; // Descomente se o chamador precisar do objeto user
      
    } catch (err: any) { // Alterado para 'err' para evitar conflito de nome se error já foi declarado
      console.error('[login] Erro capturado na função login:', err.message);
      // Verifica se um toast com o mesmo ID já não foi mostrado (para evitar duplicação)
      // A biblioteca sonner pode já lidar com isso, mas esta é uma checagem extra.
      // Se a sua versão do sonner não tem 'isActive', remova este if.
      // if (!toast.isActive || (toast.isActive && !toast.isActive(toastId))) {
      // Uma forma mais simples é apenas mostrar o toast se ele não for um dos já tratados
      if (err.message && !err.message.includes('Email e senha são obrigatórios') && !err.message.includes('Invalid login credentials') && !err.message.includes('Erro ao processar login')) {
          toast.error('Erro no login', { id: toastId, description: err.message || 'Ocorreu um problema inesperado.' });
      } else if (!err.message) {
          toast.error('Erro no login', { id: toastId, description: 'Ocorreu um problema inesperado.' });
      }
      // }
      throw err; 
    }
  }, []); // Removido navigate, pois não é usado diretamente aqui

  const loginWithGoogle = useCallback(async () => {
    const toastId = 'google-login-toast';
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/` 
        }
      });
      
      if (error) {
        console.error('Google login error from Supabase:', error.message, error);
        toast.error('Erro no login com Google', { id: toastId, description: error.message });
        throw error;
      }
      // O supabase-js lida com o redirecionamento. Não há toast de sucesso aqui.
      if (data.url) {
        // Se precisar de redirecionamento manual (geralmente não é o caso com o listener do Supabase)
        // window.location.href = data.url;
      }
      
    } catch (err: any) {
      console.error('Google login error capturado:', err.message);
      // if (!toast.isActive || (toast.isActive && !toast.isActive(toastId))) {
      toast.error('Erro no login com Google', {
        id: toastId,
        description: err.message || 'Não foi possível iniciar o login com Google.'
      });
      // }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    const toastId = 'logout-toast';
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error from Supabase:', error.message, error);
        toast.error('Erro ao fazer logout', { id: toastId, description: error.message });
        throw error;
      }
      
      toast.success('Logout realizado com sucesso!', { id: toastId });
      // navigate('/login'); // O onAuthStateChange e useAuthNavigation devem cuidar disso.
      
    } catch (err: any) {
      console.error('Logout error capturado:', err.message);
      // if (!toast.isActive || (toast.isActive && !toast.isActive(toastId))) {
      toast.error('Erro ao fazer logout', {
        id: toastId,
        description: err.message || 'Ocorreu um problema ao tentar sair.'
      });
      // }
      throw err; 
    }
  }, [navigate]); // Adicionado navigate de volta se você o usa no logout

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    options?: SignUpOptions
  ) /*: Promise<SignUpData | undefined>*/ => {
    console.log('[signUp] Iniciando cadastro para:', email, 'com opções:', options);
    const toastId = 'signup-toast';
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios para o cadastro.');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options 
      });
      
      if (error) {
        console.error('[signUp] Erro retornado pelo Supabase:', error.message, error);
        toast.error('Erro no cadastro', { id: toastId, description: error.message });
        throw error;
      }

      if (!data.user && !data.session) {
        console.error('[signUp] Cadastro sem erro, mas sem usuário ou sessão retornados.');
        const err = new Error('Erro ao processar cadastro: resposta inesperada do servidor.');
        toast.error('Erro no cadastro', { id: toastId, description: err.message });
        throw err; // Corrigido aqui para lançar 'err'
      }
      
      console.log('[signUp] Usuário criado/convidado com sucesso:', data.user?.email, data.session ? "com sessão" : "sem sessão");
      toast.success('Conta criada com sucesso!', {
        id: toastId,
        description: 'Você já pode fazer o login.'
      });
      
      return data; // Retornando data

    } catch (err: any) { // Alterado para 'err'
      console.error('[signUp] Erro capturado na função signUp:', err.message);
      // if (!toast.isActive || (toast.isActive && !toast.isActive(toastId))) {
      if (err.message && !err.message.includes('Email e senha são obrigatórios')) { // Verifica se não é o erro já tratado
          toast.error('Erro no cadastro', { id: toastId, description: err.message });
      } else if (!err.message) {
          toast.error('Erro no cadastro', { id: toastId, description: 'Não foi possível criar a conta.' });
      }
      // }
      throw err; // Corrigido aqui para lançar 'err'
    }
  }, []); // Removido navigate

  const forgotPassword = useCallback(async (email: string) => {
    console.log('[forgotPassword] Iniciando para email:', email);
    const toastId = 'forgot-password-toast';
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, 
      });
      
      if (error) {
        console.error('[forgotPassword] Erro retornado pelo Supabase:', error.message, error);
        toast.error('Erro ao enviar email de recuperação', { id: toastId, description: error.message });
        throw error;
      }
      
      console.log('[forgotPassword] Email de recuperação enviado para:', email);
      toast.success('Email de recuperação enviado', {
        id: toastId,
        description: 'Verifique sua caixa de entrada.'
      });
    } catch (err: any) { // Alterado para 'err'
      console.error('[forgotPassword] Erro capturado:', err.message);
      // if (!toast.isActive || (toast.isActive && !toast.isActive(toastId))) {
      toast.error('Erro ao enviar email de recuperação', { 
          id: toastId, 
          description: err.message || 'Verifique se o email está correto e tente novamente.' 
      });
      // }
      throw err; // Corrigido aqui para lançar 'err'
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    console.log('[resetPassword] Iniciando alteração de senha.');
    const toastId = 'reset-password-toast';
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('[resetPassword] Erro retornado pelo Supabase:', error.message, error);
        toast.error('Erro ao alterar senha', { id: toastId, description: error.message });
        throw error;
      }
      
      console.log('[resetPassword] Senha alterada com sucesso para usuário:', data.user?.email);
      toast.success('Senha alterada com sucesso!', { id: toastId });
      navigate('/login'); 
    } catch (err: any) { // Alterado para 'err'
      console.error('[resetPassword] Erro capturado:', err.message); // Corrigido aqui
      // if (!toast.isActive || (toast.isActive && !toast.isActive(toastId))) {
      toast.error('Erro ao alterar senha', { 
          id: toastId,
          description: err.message || 'Não foi possível alterar a senha. Tente novamente ou solicite um novo link.' 
      });
      // }
      throw err; // Corrigido aqui para lançar 'err'
    }
  }, [navigate]); // navigate é usado aqui

  // Certifique-se de que o objeto retornado está correto
  return {
    login,
    loginWithGoogle,
    logout,
    signUp,
    forgotPassword,
    resetPassword, // Faltava uma vírgula aqui antes
  }; // Adicionado o ponto e vírgula final do hook
}; // Adicionado o ponto e vírgula final da exportação