
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/layout/AuthLayout';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      toast.success('Email enviado', {
        description: 'Verifique seu email para redefinir sua senha',
      });
    } catch (error: any) {
      toast.error('Erro ao enviar email de recuperação', {
        description: error.message || 'Tente novamente mais tarde',
      });
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Email enviado"
        subtitle="Verifique sua caixa de entrada para o link de recuperação de senha"
      >
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Um email com instruções para redefinir sua senha foi enviado para o endereço informado.
            Por favor, verifique sua caixa de entrada e clique no link para continuar.
          </p>
          <Link to="/login">
            <Button variant="outline">
              Voltar para o login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Digite seu email para receber um link de recuperação"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
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
            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
              Voltar para o login
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
