// src/hooks/useAuthActions.ts
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { autoAssignDefaultExams } from '@/utils/autoAssignExams';
import { AuthError, Session, User, UserResponse } from '@supabase/supabase-js';

interface SignUpOptions {
  data?: Record<string, any>;
  emailRedirectTo?: string;
}

// Ajustando o tipo SignUpResult para ser mais direto e compatível
interface SignUpResult {
  data: { user: User | null; session: Session | null; } | null; // Supabase signUp pode retornar { user, session } em data ou apenas { user } ou { session }
  error: AuthError | null;
}

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
    console.log('[login] Iniciando login com email:', email);
    try {
      if (!email || !password) throw new Error('Email e senha são obrigatórios');
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('[login] Erro do Supabase:', error.message);
        toast.error(error.message.includes('Invalid login credentials') ? 'Email ou senha inválidos' : `Erro no login: ${error.message}`);
        throw error; 
      }
      if (!data.user) {
        const err = new Error('Erro ao processar login: usuário não encontrado.');
        toast.error('Erro no login', { description: err.message });
        throw err;
      }
      toast.success('Login realizado com sucesso!');
      return { user: data.user, error: null };
    } catch (err: any) { 
      console.error('[login] Erro capturado:', err.message);
      // Se o toast não foi mostrado pela condição específica acima, mostra um genérico
      if (!err.message.includes('Email e senha são obrigatórios') && !err.message.includes('Invalid login credentials') && !err.message.includes('usuário não encontrado')) {
          toast.error('Erro no login', { description: err.message || 'Ocorreu um problema inesperado.' });
      }
      throw err; 
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) {
        toast.error('Erro no login com Google', { description: error.message });
        throw error;
      }
      // O redirecionamento é tratado pelo Supabase
    } catch (err: any) {
      toast.error('Erro no login com Google', { description: err.message || 'Não foi possível iniciar o login com Google.' });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erro ao fazer logout', { description: error.message });
        throw error;
      }
      toast.success('Logout realizado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao fazer logout', { description: err.message || 'Ocorreu um problema ao tentar sair.' });
      throw err; 
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    options?: SignUpOptions
  ): Promise<SignUpResult> => {
    console.log('[signUp] Iniciando cadastro para:', email);
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios para o cadastro.');
      }
      
      // BYPASS TEMPORÁRIO: Força confirmação automática
      const signUpOptions = {
        ...options,
        data: {
          ...options?.data,
          email_confirm: false // Bypass da confirmação
        }
      };
      
      console.log('[signUp] Tentando signup com bypass de confirmação...');
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: signUpOptions 
      });
      
      if (error) {
        console.error('[signUp] Erro do Supabase:', error.message);
        
        // Se erro for de confirmação, tenta workaround
        if (error.message?.includes('confirm') || error.message?.includes('verification')) {
          console.log('[signUp] Tentando workaround para confirmação...');
          
          // Tenta fazer login direto (usuário pode ter sido criado mas não confirmado)
          try {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (!loginError && loginData.user) {
              console.log('[signUp] Workaround bem-sucedido - usuário logado diretamente!');
              toast.success('Conta criada com sucesso!', { description: 'Você já está logado.' });
              return { data: loginData, error: null };
            }
          } catch (loginErr) {
            console.error('[signUp] Workaround falhou:', loginErr);
          }
        }
        
        toast.error('Erro no cadastro', { description: error.message });
        return { data: null, error }; // Ajustado para data: null em caso de erro
      }

      // Com ENABLE_EMAIL_AUTOCONFIRM=true, data.user ou data.session deve existir
      if (!data.user && !data.session) { 
        const err = new AuthError('Erro ao processar cadastro: dados de usuário ou sessão não retornados.');
        console.error('[signUp] Cadastro sem erro, mas sem usuário ou sessão.');
        toast.error('Erro no cadastro', { description: err.message });
        return { data: null, error: err }; // Ajustado para data: null
      }
      
      // Atribuir concursos automaticamente se o usuário foi criado
      if (data?.user?.id) {
        console.log('[signUp] Atribuindo concursos automaticamente...');
        await autoAssignDefaultExams(data.user.id);
      }
      
      toast.success('Conta criada com sucesso!', { description: 'Você já pode fazer o login.' });
      return { data, error: null };

    } catch (err: any) { 
      console.error('[signUp] Erro capturado:', err.message);
      const authError = err instanceof AuthError ? err : new AuthError(err.message || 'Não foi possível criar a conta.');
      // Mostra toast apenas se não for o de campos obrigatórios (que já seria lançado antes)
      if (err.message && !err.message.includes('obrigatórios')) {
          toast.error('Erro no cadastro', { description: authError.message });
      } else if (!err.message) {
          toast.error('Erro no cadastro', { description: 'Não foi possível criar a conta.' });
      }
      return { data: null, error: authError }; // Ajustado para data: null
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, 
      });
      if (error) {
        toast.error('Erro ao enviar email', { description: error.message });
        return { error };
      }
      toast.success('Email de recuperação enviado', { description: 'Verifique sua caixa de entrada.' });
      return { error: null };
    } catch (err: any) { 
      const authError = err instanceof AuthError ? err : new AuthError(err.message || 'Erro ao enviar email.');
      toast.error('Erro ao enviar email', { description: authError.message });
      return { error: authError };
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string): Promise<{ data: { user: User | null }, error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error('Erro ao alterar senha', { description: error.message });
        return { data: {user: null }, error };
      }
      toast.success('Senha alterada com sucesso!');
      navigate('/login'); 
      return { data, error: null };
    } catch (err: any) { 
      const authError = err instanceof AuthError ? err : new AuthError(err.message || 'Não foi possível alterar a senha.');
      toast.error('Erro ao alterar senha', { description: authError.message });
      return { data: {user: null }, error: authError };
    }
  }, [navigate]);

  return {
    login,
    loginWithGoogle,
    logout,
    signUp,
    forgotPassword,
    resetPassword,
  };
};