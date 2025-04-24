
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Login attempt with email:', email);
      
      if (!email || !password) {
        console.error('Missing email or password');
        throw new Error('Email e senha são obrigatórios');
      }
      
      console.log('Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Login error:', error);
        console.error('Login error details:', { code: error.code, message: error.message });
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos');
        }
        throw error;
      }
      
      if (!data.user) {
        console.error('No user returned after successful login');
        throw new Error('Erro ao processar login');
      }
      
      console.log('Login successful:', data.user.email);
      console.log('Session established:', !!data.session);
      console.log('User details:', {
        id: data.user.id,
        email: data.user.email,
        sessionExpiry: data.session?.expires_at
      });
      
      toast.success('Login realizado com sucesso');
      
      // Determine o papel do usuário e redirecione para o dashboard correspondente
      console.log('Fetching user profile for role-based redirection...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast.error('Perfil de usuário não encontrado', {
          description: 'Redirecionando para dashboard padrão'
        });
        navigate('/dashboard');
        return;
      }
        
      console.log('User role:', profileData?.role);
      
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
      console.error('Login error:', error);
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
      console.log('Registering new user:', email);
      console.log('Registration data:', { name: metadata.name, birth_date: metadata.birth_date, cpf: 'hidden for privacy' });
      
      if (!email || !password) {
        console.error('Missing email or password');
        throw new Error('Email e senha são obrigatórios');
      }
      
      // 1. Signup with Supabase Auth
      console.log('Calling supabase.auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            cpf: metadata.cpf,
            birth_date: metadata.birth_date,
            role: 'student'  // Default role for all signed up users
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        console.error('Error details:', { code: error.code, message: error.message });
        throw error;
      }

      if (!data.user) {
        console.error('No user returned after successful signup');
        throw new Error('Erro ao processar cadastro');
      }

      console.log('User registered successfully:', data.user.id);

      // 2. Create profile record in profiles table
      console.log('Creating profile for user:', data.user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          name: metadata.name,
          role: 'student', // Always student for signup via platform
          birth_date: metadata.birth_date,
          cpf: metadata.cpf
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        console.error('Profile error details:', { code: profileError.code, message: profileError.message });
        toast.error('Erro ao criar perfil', { 
          description: profileError.message 
        });
      } else {
        console.log('Profile created successfully:', profileData);
      }
      
      toast.success('Conta criada com sucesso', {
        description: 'Você será redirecionado para a página de login'
      });
      
      // 3. Redirect to login page
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
