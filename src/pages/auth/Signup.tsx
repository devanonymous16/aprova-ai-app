
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/layout/AuthLayout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const passwordSchema = z.string()
  .min(6, 'Senha deve ter no mínimo 6 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  birthDate: z.string().refine(val => {
    const date = new Date(val);
    const today = new Date();
    const minAge = new Date();
    minAge.setFullYear(today.getFullYear() - 13); // 13 anos mínimo
    return !isNaN(date.getTime()) && date <= minAge;
  }, { message: 'Você deve ter pelo menos 13 anos' }),
  password: passwordSchema,
  confirmPassword: z.string().min(6, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const { signUp } = useAuth();
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      birthDate: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      await signUp(values.email, values.password, values.name);
      // O redirecionamento e manejo de erros é feito no método signUp
    } catch (error) {
      // Error handling is done in the signup method
    }
  };

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle={
        <>
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Faça login
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
          
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de nascimento</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500 mt-1">
                  Sua senha deve conter no mínimo 6 caracteres, uma letra maiúscula e um número.
                </p>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirme sua senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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
            {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta gratuita'}
          </Button>
        </form>
      </Form>

      <div className="mt-6">
        <p className="text-xs text-gray-500 text-center">
          Ao criar uma conta, você concorda com os{' '}
          <Link to="/terms" className="text-primary-600 hover:text-primary-500">
            Termos de Serviço
          </Link>{' '}
          e{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
