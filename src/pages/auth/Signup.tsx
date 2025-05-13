// src/pages/auth/Signup.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/layout/AuthLayout';
import { format, isValid, parseISO } from 'date-fns';
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const cpfRegex = /^\d{11}$/;
const cpfErrorMessage = 'CPF inválido. Digite apenas os 11 números.';

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().regex(cpfRegex, cpfErrorMessage).transform(val => val.replace(/\D/g, '')),
  birthDate: z.string().refine(val => {
    if (!val) return false; // Adiciona verificação para string vazia
    const date = parseISO(val);
    if (!isValid(date)) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const minAgeDate = new Date(today);
    minAgeDate.setFullYear(today.getFullYear() - 13);
    return date <= minAgeDate;
  }, { message: 'Você deve ter pelo menos 13 anos e a data deve ser válida' }),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email');
  const orgIdFromQuery = queryParams.get('org_id');
  const nameFromQuery = queryParams.get('name');
  const cpfFromQuery = queryParams.get('cpf')?.replace(/\D/g, '');

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: nameFromQuery || '',
      email: emailFromQuery || '',
      cpf: cpfFromQuery || '',
      birthDate: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    form.reset({
      name: nameFromQuery || '',
      email: emailFromQuery || '',
      cpf: cpfFromQuery || '',
      birthDate: form.getValues('birthDate') || '', // Mantém birthDate se já digitado
      password: '', // Limpa senhas por segurança
      confirmPassword: '',
    });
  }, [nameFromQuery, emailFromQuery, cpfFromQuery, form]); // form.getValues não deve estar na dependência


  const onSubmit = async (values: SignupFormValues) => {
    try {
      const { cpf, name, birthDate, email, password } = values;

      // Se sua função signUp no AuthContext foi atualizada para aceitar options: {data: {...}}
      // e não retorna nada (void), a chamada fica assim:
      await signUp(
        email,
        password,
        { // options
          data: { // options.data (para raw_user_meta_data)
            initial_name: name,
            cpf_to_set: cpf,
            birth_date_to_set: birthDate, // A trigger precisa ler isso
            invited_to_org_id: orgIdFromQuery,
            role: 'student'
          }
        }
      );
      
      // Assumindo que o signUp no AuthContext lida com toasts de sucesso/erro e lança erro em caso de falha.
      console.log('Cadastro submetido. Redirecionando para login...');
      navigate('/login');
      // form.reset(); // Opcional resetar aqui, ou deixar para o useEffect ao sair da página

    } catch (error: any) {
      // Este catch é para o caso de o signUp no AuthContext lançar um erro
      console.error("Erro capturado no onSubmit do SignupPage:", error.message);
      // O toast de erro já deve ter sido disparado pelo AuthContext.
    }
  };

  return (
    <AuthLayout // Removida a prop 'title'
      subtitle={
         <>
           Já tem uma conta?{' '}
           <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
             Faça login
           </Link>
         </>
       }
    >
      {/* O título específico da página "Crie sua conta" vai aqui DENTRO do children do AuthLayout */}
      <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900">
        Crie sua conta
      </h2>
      
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={async () => {
            try {
              await loginWithGoogle();
            } catch (error) { /* Erro tratado no loginWithGoogle */ }
          }}
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuar com Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome completo</FormLabel> <FormControl><Input {...field} disabled={!!nameFromQuery && !!orgIdFromQuery} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="cpf" render={({ field }) => ( <FormItem> <FormLabel>CPF</FormLabel> <FormControl><Input {...field} placeholder="Digite apenas números" maxLength={11} disabled={!!cpfFromQuery && !!orgIdFromQuery} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="birthDate" render={({ field }) => ( <FormItem> <FormLabel>Data de nascimento</FormLabel> <FormControl><Input {...field} type="date" max={format(new Date(), 'yyyy-MM-dd')} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input {...field} type="email" disabled={!!emailFromQuery && !!orgIdFromQuery} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="password" render={({ field }) => ( <FormItem> <FormLabel>Senha</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> <p className="text-xs text-gray-500 mt-1">Sua senha deve conter no mínimo 6 caracteres, uma letra maiúscula e um número.</p> </FormItem> )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => ( <FormItem> <FormLabel>Confirme sua senha</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            {orgIdFromQuery && (<p className="text-sm text-muted-foreground">Você está sendo convidado para uma organização. Seus dados (Nome, CPF, Email) foram pré-preenchidos.</p>)}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </Form>
      </div>
      <div className="mt-6">
        <p className="text-xs text-gray-500 text-center">
          Ao criar uma conta, você concorda com os{' '}
          <Link to="/terms" className="text-primary-600 hover:text-primary-500">Termos de Serviço</Link>{' '}
          e{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-500">Política de Privacidade</Link>
        </p>
      </div>
    </AuthLayout>
  );
}