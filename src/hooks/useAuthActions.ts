
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { UserRole } from '@/types/user';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[DIAGNÓSTICO] Tentativa de login com email:', email);
      
      if (!email || !password) {
        console.error('[DIAGNÓSTICO] Email ou senha ausentes');
        throw new Error('Email e senha são obrigatórios');
      }
      
      console.log('[DIAGNÓSTICO] Chamando supabase.auth.signInWithPassword...');
      
      // Teste de conexão antes de tentar login
      try {
        const { error: pingError } = await supabase.from('profiles').select('count').limit(1);
        console.log('[DIAGNÓSTICO] Teste de conexão antes do login:', pingError ? 'ERRO' : 'OK');
        if (pingError) {
          console.error('[DIAGNÓSTICO] Erro no teste de conexão:', pingError);
        }
      } catch (pingEx) {
        console.error('[DIAGNÓSTICO] Exceção no teste de conexão:', pingEx);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('[DIAGNÓSTICO] Erro no login:', error);
        console.error('[DIAGNÓSTICO] Detalhes do erro:', { 
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
        console.error('[DIAGNÓSTICO] Nenhum usuário retornado após login bem-sucedido');
        throw new Error('Erro ao processar login');
      }
      
      console.log('[DIAGNÓSTICO] Login bem-sucedido:', data.user.email);
      console.log('[DIAGNÓSTICO] Sessão estabelecida:', !!data.session);
      console.log('[DIAGNÓSTICO] Detalhes do usuário:', {
        id: data.user.id,
        email: data.user.email,
        sessionExpiry: data.session?.expires_at
      });
      
      toast.success('Login realizado com sucesso');
      
      // Determine o papel do usuário e redirecione para o dashboard correspondente
      console.log('[DIAGNÓSTICO] Buscando perfil do usuário para redirecionamento baseado em papel...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('[DIAGNÓSTICO] Erro ao buscar perfil do usuário:', profileError);
        console.error('[DIAGNÓSTICO] Detalhes do erro do perfil:', {
          code: profileError.code,
          message: profileError.message,
          hint: profileError.hint || 'Sem dica',
          details: profileError.details || 'Sem detalhes'
        });
        toast.error('Perfil de usuário não encontrado', {
          description: 'Redirecionando para dashboard padrão'
        });
        navigate('/dashboard');
        return;
      }
        
      console.log('[DIAGNÓSTICO] Papel do usuário:', profileData?.role);
      
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
      console.error('[DIAGNÓSTICO] Erro no login:', error);
      toast.error('Erro no login', {
        description: error.message || 'Verifique suas credenciais'
      });
      throw error;
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
      console.log('Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }
      
      console.log('Logout successful');
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Erro no logout', {
        description: error.message || 'Tente novamente'
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

      // 2. Criar registro de perfil na tabela profiles
      console.log('[DIAGNÓSTICO] Criando perfil para usuário:', data.user.id);
      
      // Usamos uma constante com o tipo correto que o Supabase espera
      const userRole: "student" | "manager" | "admin" = "student";
      
      const profileData = {
        id: data.user.id,
        email: email,
        name: metadata.name,
        role: userRole, // Usando o valor tipado corretamente
        birth_date: metadata.birth_date,
        cpf: metadata.cpf
      };
      
      console.log('[DIAGNÓSTICO] Dados do perfil a inserir:', {
        ...profileData,
        cpf: 'oculto por privacidade'
      });
      
      const { data: insertedProfile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('[DIAGNÓSTICO] Erro ao criar perfil:', profileError);
        console.error('[DIAGNÓSTICO] Detalhes do erro do perfil:', {
          code: profileError.code,
          message: profileError.message,
          hint: profileError.hint || 'Sem dica',
          details: profileError.details || 'Sem detalhes'
        });
        toast.error('Erro ao criar perfil', { 
          description: profileError.message 
        });
      } else {
        console.log('[DIAGNÓSTICO] Perfil criado com sucesso:', insertedProfile);
      }
      
      toast.success('Conta criada com sucesso', {
        description: 'Você será redirecionado para a página de login'
      });
      
      // 3. Redirect to login page
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
