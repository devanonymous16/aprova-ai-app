import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/layout/AuthLayout';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const loginType = searchParams.get('type') || 'b2c';
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      form.clearErrors();
      form.reset({ ...form.getValues() }, { keepValues: true });
      await login(values.email, values.password);
    } catch (error: any) {
      form.reset({ ...values }, { keepValues: true });
      toast.error('Erro no login', {
        description: error.message || 'Não foi possível fazer login. Tente novamente.'
      });
    }
  };

  return (
    <AuthLayout 
      title={loginType === 'b2b' ? 'Acesso para alunos de cursinhos' : 'Entre em sua conta'}
      subtitle={
        <>
          {loginType === 'b2b' 
            ? 'Use as credenciais fornecidas pelo seu cursinho' 
            : 'Não tem uma conta? '}
          {' '}
          {loginType === 'b2b' 
            ? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sou aluno individual
              </Link>
            : <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                Cadastre-se agora
              </Link>
          }
        </>
      }
    >
      <div className="space-y-6">
        <GoogleSignInButton />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">ou continue com</span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <div className="text-right mt-1">
                    <Link 
                      to="/forgot-password"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary-900 hover:bg-primary-800 mt-6"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
