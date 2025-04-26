import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { UserRole } from '@/types/user';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[DIAGNÓSTICO LOGIN] useAuthActions.login: Iniciando com email:', email);
      
      if (!email || !password) {
        console.error('[DIAGNÓSTICO LOGIN] Email ou senha ausentes');
        throw new Error('Email e senha são obrigatórios');
      }
      
      // Set a timeout to prevent infinite loading
      const loginTimeout = setTimeout(() => {
        console.error('[DIAGNÓSTICO LOGIN] Timeout atingido (10s)');
        throw new Error('Tempo limite excedido. Tente novamente.');
      }, 10000);
      
      console.log('[DIAGNÓSTICO LOGIN] Chamando supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      // Clear timeout as we got a response
      clearTimeout(loginTimeout);
      
      if (error) {
        console.error('[DIAGNÓSTICO LOGIN] Erro no signInWithPassword:', error);
        console.error('[DIAGNÓSTICO LOGIN] Detalhes do erro:', { 
          code: error.code, 
          message: error.message,
          status: error.status
        });
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos');
        }
        throw error;
      }
      
      if (!data.user) {
        console.error('[DIAGNÓSTICO LOGIN] Nenhum usuário retornado após login bem-sucedido');
        throw new Error('Erro ao processar login: usuário não encontrado');
      }
      
      console.log('[DIAGNÓSTICO LOGIN] Login Supabase bem-sucedido:', {
        userId: data.user.id,
        email: data.user.email,
        sessionExpiry: data.session?.expires_at
      });
      
      // Determine user role and redirect
      console.log('[DIAGNÓSTICO LOGIN] Buscando perfil do usuário...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('[DIAGNÓSTICO LOGIN] Erro ao buscar perfil:', profileError);
        throw new Error('Erro ao carregar perfil do usuário');
      }
      
      console.log('[DIAGNÓSTICO LOGIN] Perfil encontrado:', profileData);
      
      // Show success message
      toast.success('Login realizado com sucesso');
      
      // Redirect based on role
      console.log('[DIAGNÓSTICO LOGIN] Redirecionando com base no papel:', profileData.role);
      
      if (profileData?.role === 'student') {
        navigate('/dashboard/student');
      } else if (profileData?.role === 'manager') {
        navigate('/dashboard/manager');
      } else if (profileData?.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error('[DIAGNÓSTICO LOGIN] Erro durante o processo de login:', error);
      console.error('[DIAGNÓSTICO LOGIN] Stack trace:', error.stack);
      throw error; // Re-throw to be handled by the form
    }
  }, [navigate]);

  const loginWithGoogle = useCallback(async () => {
    try {
      console.log('Iniciando login com Google...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Erro no login com Google:', error);
        throw error;
      }
      
      console.log('Login com Google iniciado:', data);
    } catch (error: any) {
      console.error('Erro ao iniciar login com Google:', error);
      toast.error('Erro no login com Google', {
        description: error.message || 'Tente novamente mais tarde'
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('[DIAGNÓSTICO LOGOUT] Iniciando logout completo (useAuthActions)');
      
      // 1. Verificar sessão atual antes de tentar logout
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('[DIAGNÓSTICO LOGOUT] Sessão atual antes do logout:', 
        sessionData.session ? 'Existe sessão' : 'Sem sessão');
      
      console.log('[DIAGNÓSTICO LOGOUT] Chamando supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Força a remoção de todas as sessões
      });
      
      if (error) {
        console.error('[DIAGNÓSTICO LOGOUT] Erro no signOut:', error);
        throw error;
      }
      
      console.log('[DIAGNÓSTICO LOGOUT] signOut concluído, limpando localStorage...');
      
      // 2. Limpar TODOS os possíveis tokens e dados do Supabase no localStorage
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth')
      );
      
      console.log('[DIAGNÓSTICO LOGOUT] Chaves do Supabase encontradas:', supabaseKeys);
      
      // Remover cada chave encontrada
      supabaseKeys.forEach(key => {
        console.log('[DIAGNÓSTICO LOGOUT] Removendo chave:', key);
        localStorage.removeItem(key);
      });
      
      // 3. Limpar explicitamente as chaves mais comuns
      localStorage.removeItem('sb-supabase-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // 4. Verificar se a sessão foi realmente limpa
      const { data: checkSession } = await supabase.auth.getSession();
      console.log('[DIAGNÓSTICO LOGOUT] Verificação da sessão após logout:', 
        checkSession.session ? 'ERRO: Ainda existe sessão!' : 'OK: Sessão removida');
      
      if (checkSession.session) {
        console.error('[DIAGNÓSTICO LOGOUT] ALERTA: Sessão ainda existe após logout! Forçando limpeza...');
        // Ultima tentativa: forçar limpeza de estado local e redirecionamento
        window.localStorage.clear(); // Limpeza radical
      }
      
      // 5. Notificar sucesso
      console.log('[DIAGNÓSTICO LOGOUT] Logout completo, redirecionando...');
      toast.success('Logout realizado com sucesso');
      
      // 6. Forçar navegação com recarregamento completo para garantir a limpeza de todo o estado
      console.log('[DIAGNÓSTICO LOGOUT] Forçando navegação para /login com reload completo');
      window.location.href = '/login';
      
    } catch (error: any) {
      console.error('[DIAGNÓSTICO LOGOUT] Erro detalhado no logout:', error);
      
      // Fallback: limpar localStorage e forçar redirecionamento mesmo em caso de erro
      console.log('[DIAGNÓSTICO LOGOUT] Executando limpeza de emergência do localStorage');
      localStorage.clear();
      
      toast.error('Erro no logout, mas redirecionando mesmo assim', {
        description: error.message || 'Tente novamente'
      });
      
      // Forçar redirecionamento com reload mesmo em caso de erro
      console.log('[DIAGNÓSTICO LOGOUT] Redirecionamento de emergência para /login');
      window.location.replace('/login');
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
      
      // Redirect to login page após breve delay
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
