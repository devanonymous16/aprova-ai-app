
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useSignUp = () => {
  const navigate = useNavigate();

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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            cpf: metadata.cpf,
            birth_date: metadata.birth_date,
            role: 'student'
          }
        }
      });
      
      if (error) {
        console.error('Erro no cadastro (auth):', error);
        throw error;
      }

      console.log('Cadastro de auth bem-sucedido:', data);
      
      if (data.user) {
        console.log('Criando registro de perfil para:', data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: metadata.name,
            role: 'student',
            birth_date: metadata.birth_date,
            cpf: metadata.cpf
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          toast.error('Erro ao criar perfil', { 
            description: profileError.message 
          });
        } else {
          console.log('Perfil criado com sucesso');
        }
      }
      
      toast.success('Conta criada com sucesso', {
        description: 'Você será redirecionado para a página de login'
      });
      
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

  return { signUp };
};
