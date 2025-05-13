import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { AuthUser } from '@supabase/supabase-js'; // Importar se for tipar o retorno

// Interface para as opções que o supabase.auth.signUp espera, incluindo 'data' para metadados
interface SignUpOptions {
  data?: Record<string, any>;
  emailRedirectTo?: string;
  // outras opções do Supabase Auth podem ser adicionadas aqui se necessário
}

export const useAuthActions = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    console.log('[login] Iniciando login com email:', email);
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
        console.error('[login] Erro retornado pelo Supabase:', error);
        if (error.message.includes('Invalid login credentials')) {
          // Modificado para usar toast.error diretamente
          toast.error('Email ou senha inválidos');
        } else {
          toast.error('Erro no login', { description: error.message });
        }
        throw error; // Re-lança para que o chamador saiba
      }
      
      if (!data.user) {
        console.error('[login] Login sem erro, mas sem usuário retornado');
        const err = new Error('Erro ao processar login: usuário não encontrado');
        toast.error('Erro no login', { description: err.message });
        throw err;
      }
      
      console.log('[login] Login bem-sucedido para:', data.user.email);
      toast.success('Login realizado com sucesso');
      // O redirecionamento é tratado pelo useAuthNavigation no App.tsx
      
      // Se você quiser retornar o usuário:
      // return data.user;
      
    } catch (error: any) {
      console.error('[login] Erro capturado:', error.message);
      // Se o toast não foi mostrado acima, adicione um genérico
      if (!error.message.includes('Email ou senha inválidos') && !error.message.includes('Erro ao processar login')) {
          toast.error('Erro no login', { description: 'Ocorreu um problema ao tentar fazer login.' });
      }
      throw error; // Garante que o chamador saiba do erro
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // O redirectTo do OAuth é para onde o Supabase redireciona APÓS o Google autenticar.
          // O Supabase então processa a sessão e o onAuthStateChange cuida do resto.
          redirectTo: `${window.location.origin}/` // Redireciona para a raiz, o useAuthNavigation decide o dashboard
        }
      });
      
      if (error) throw error;
      // Não há toast de sucesso aqui, pois o fluxo é um redirecionamento.
      // O sucesso é implícito se não houver erro e o usuário for redirecionado.
      
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
      
      // Limpeza de localStorage não é mais estritamente necessária com os listeners do Supabase,
      // mas pode ser mantida se houve problemas passados.
      // const supabaseKeys = Object.keys(localStorage).filter(key => 
      //   key.includes('supabase') || key.includes('sb-') || key.includes('auth')
      // );
      // supabaseKeys.forEach(key => localStorage.removeItem(key));
      
      toast.success('Logout realizado com sucesso');
      // O onAuthStateChange (evento SIGNED_OUT) deve limpar o estado.
      // O useAuthNavigation deve redirecionar para /login.
      // O window.location.href é um fallback mais agressivo.
      // Se o useAuthNavigation estiver funcionando bem, este timeout pode não ser necessário.
      // setTimeout(() => {
      //   if (window.location.pathname !== '/login') { // Evita recarregar se já estiver no login
      //      window.location.href = '/login';
      //   }
      // }, 300);
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout', {
        description: error.message || 'Tente novamente'
      });
      // if (window.location.pathname !== '/login') {
      //    window.location.href = '/login';
      // }
      throw error; // Permite que o chamador trate, se necessário
    }
  }, []);

  // ========= INÍCIO DA MODIFICAÇÃO EM signUp =========
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    options?: SignUpOptions // Modificado para aceitar o objeto options completo
  ) => {
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      // A variável 'options' já contém 'data' com os metadados corretos
      // e pode conter 'emailRedirectTo' se precisarmos.
      // Por agora, vamos manter o emailRedirectTo padrão do Supabase Auth
      // ou o que for definido globalmente.
      // Se você quiser forçar um emailRedirectTo específico para signup:
      // const signUpOptions = {
      //   ...options,
      //   emailRedirectTo: options?.emailRedirectTo || `${window.location.origin}/login`
      // };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options // Passa o objeto options diretamente
      });
      
      if (error) {
        toast.error('Erro no cadastro', { description: error.message });
        throw error;
      }

      // Com ENABLE_EMAIL_AUTOCONFIRM=true, data.user não será nulo se não houver erro,
      // e o email já estará confirmado.
      if (!data.user && !data.session) { // data.user pode ser null se a confirmação for necessária, mas com auto-confirm deve haver session.
        const err = new Error('Erro ao processar cadastro: dados de usuário ou sessão não retornados.');
        toast.error('Erro no cadastro', { description: err.message });
        throw err;
      }
      
      // A mensagem de "Verifique seu email" não é mais precisa com auto-confirmação.
      toast.success('Conta criada com sucesso!', {
        description: 'Você já pode fazer o login.'
      });
      
      // Opcional: retornar data para o chamador se precisar do user/session
      // return { data, error: null }; 
      // Se não retornar, o chamador (SignupPage) não deve tentar desestruturar.
      // Por consistência com o erro original (Property 'data' does not exist on type 'void'),
      // vamos assumir que não há retorno aqui.
      
      // Redirecionar para login após um breve delay para o toast ser visível
      // setTimeout(() => {
      //   navigate('/login');
      // }, 1500); 
      // O navigate('/login') já está no SignupPage.tsx, podemos remover daqui para evitar duplicação.

    } catch (error: any) {
      console.error('Signup error (useAuthActions):', error.message);
      // O toast de erro já deve ter sido mostrado no bloco if (error) acima.
      // Se não, e for um erro inesperado:
      if (!error.message.includes('Erro no cadastro')) {
          toast.error('Erro no cadastro', { description: error.message || 'Não foi possível criar a conta' });
      }
      throw error; // Re-lança para o componente poder tratar se quiser (ex: parar isSubmitting)
    }
  }, [navigate]); // Removido navigate daqui se ele não for mais usado diretamente nesta função
  // ========= FIM DA MODIFICAÇÃO EM signUp =========

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // Onde o usuário define a nova senha
      });
      
      if (error) {
        toast.error('Erro ao enviar email de recuperação', { description: error.message });
        throw error;
      }
      
      toast.success('Email de recuperação enviado', {
        description: 'Verifique sua caixa de entrada'
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (!error.message.includes('Erro ao enviar email de recuperação')) {
         toast.error('Erro ao enviar email de recuperação', { description: error.message || 'Verifique se o email está correto' });
      }
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    try {
      // Para resetar a senha, o usuário já deve estar em um fluxo onde o Supabase Auth
      // tem o token de recuperação (geralmente da URL após clicar no link do email).
      // O supabase-js lida com isso automaticamente se o usuário estiver na página correta.
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast.error('Erro ao alterar senha', { description: error.message });
        throw error;
      }
      
      toast.success('Senha alterada com sucesso');
      navigate('/login'); // Redireciona para o login após sucesso
    } catch (error: any) {
      console.error('Password update error:', error);
       if (!error.message.includes('Erro ao alterar senha')) {
          toast.error('Erro ao alterar senha', { description: error.message || 'Por favor, tente novamente ou solicite um novo link' });
      }
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