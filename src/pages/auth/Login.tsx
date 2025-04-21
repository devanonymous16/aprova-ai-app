import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Verifique se há um tipo de login especificado (B2B vs B2C)
  const loginType = searchParams.get('type') || 'b2c';
  
  // Sugestão de email baseado no tipo de login (para facilitar testes da demo)
  const emailPlaceholder = loginType === 'b2b' 
    ? 'aluno.b2b@exemplo.com'
    : 'aluno@exemplo.com';

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      // Error handling is done in the login method
    }
  };
  
  // Preencher automaticamente emails para demo (remover em produção)
  const fillDemoCredentials = (type: string) => {
    switch (type) {
      case 'admin':
        setEmail('admin@forefy.com');
        break;
      case 'manager':
        setEmail('manager@forefy.com');
        break;
      case 'student':
        setEmail('student@forefy.com');
        break;
      case 'b2b':
        setEmail('student.b2b@forefy.com');
        break;
    }
    setPassword('password123');
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-gradient font-heading">
          Forefy
        </h1>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900 font-heading">
          {loginType === 'b2b' ? 'Acesso para alunos de cursinhos' : 'Entre em sua conta'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {loginType === 'b2b' 
            ? 'Use as credenciais fornecidas pelo seu cursinho' 
            : 'Não tem uma conta?'
          }
          {' '}
          {loginType === 'b2b' 
            ? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sou aluno individual</Link>
            : <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">Cadastre-se agora</Link>
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={emailPlaceholder}
                        {...field}
                      />
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
                      <Input
                        type="password"
                        {...field}
                      />
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
                {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
          
          {/* DEMO: Seção de login rápido para teste (remover em produção) */}
          <div className="mt-8 border-t pt-6">
            <p className="mb-4 text-sm text-gray-500 text-center">Demo: Acesso rápido por perfil</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('admin')}
                className="text-xs"
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('manager')}
                className="text-xs"
              >
                Gerente
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('student')}
                className="text-xs"
              >
                Estudante
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('b2b')}
                className="text-xs"
              >
                Estudante B2B
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function setEmail(email: string) {
    form.setValue('email', email);
  }

  function setPassword(password: string) {
    form.setValue('password', password);
  }
}
