
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/layout/AuthLayout';
import { toast } from '@/components/ui/sonner';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success('Senha atualizada com sucesso', {
        description: 'Agora você pode fazer login com sua nova senha',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast.error('Erro ao atualizar senha', {
        description: error.message || 'Por favor, tente novamente ou solicite um novo link',
      });
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Senha atualizada"
        subtitle="Sua senha foi redefinida com sucesso"
      >
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Você será redirecionado para a página de login em alguns segundos...
          </p>
          <Link to="/login">
            <Button>
              Ir para o login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Definir nova senha"
      subtitle="Escolha uma nova senha para sua conta"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirme a nova senha</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary-900 hover:bg-primary-800"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Atualizando...' : 'Atualizar senha'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
