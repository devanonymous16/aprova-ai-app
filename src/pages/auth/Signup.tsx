// src/pages/auth/Signup.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/layout/AuthLayout';
import { format, isValid, parseISO } from 'date-fns';

import {
  Form, // Componente Form com 'F' maiúsculo
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
    if (!val) return false;
    const date = parseISO(val);
    if (!isValid(date)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

  const [queryEmail, setQueryEmail] = useState<string | null>(null);
  const [queryName, setQueryName] = useState<string | null>(null);
  const [queryCpf, setQueryCpf] = useState<string | null>(null);
  const [queryOrgId, setQueryOrgId] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({ // form com 'f' minúsculo
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      birthDate: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQueryEffect = queryParams.get('email');
    const nameFromQueryEffect = queryParams.get('name');
    const cpfFromQueryEffect = queryParams.get('cpf')?.replace(/\D/g, '');
    const orgIdFromQueryEffect = queryParams.get('org_id');

    setQueryEmail(emailFromQueryEffect);
    setQueryName(nameFromQueryEffect);
    setQueryCpf(cpfFromQueryEffect);
    setQueryOrgId(orgIdFromQueryEffect);

    form.reset({
      name: nameFromQueryEffect || form.getValues('name') || '',
      email: emailFromQueryEffect || form.getValues('email') || '',
      cpf: cpfFromQueryEffect || form.getValues('cpf') || '',
      birthDate: form.getValues('birthDate') || '',
      password: '',
      confirmPassword: '',
    });
    // navigate(location.pathname, { replace: true }); 
  }, [location.search, form]);


  const onSubmit = async (values: SignupFormValues) => {
    try { // Bloco try CORRETO envolvendo toda a lógica de submit
      const { cpf, name, birthDate, email, password } = values;

      if (queryOrgId && (!queryEmail || !queryName || !queryCpf)) {
        form.setError("root", { message: "Dados do convite parecem incompletos. Tente o link novamente." });
        return;
      }

      const optionsData: Record<string, any> = {
        initial_name: name,
        cpf_to_set: cpf,
        birth_date_to_set: birthDate,
        role: 'student'
      };

      if (queryOrgId) {
        optionsData.invited_to_org_id = queryOrgId;
      }
      
      await signUp(
        email,
        password,
        { data: optionsData }
      );
      
      // Se chegou aqui, signUp foi bem-sucedido (não lançou erro)
      console.log('Cadastro bem-sucedido. Redirecionando para login...');
      navigate('/login');

    } catch (signUpError: any) { // Catch CORRETO para o try acima
      console.error("Erro capturado no onSubmit do SignupPage:", signUpError.message);
      form.setError("root", { message: signUpError.message || "Ocorreu um erro inesperado." });
    }
  };

  return (
    <AuthLayout
      subtitle={
        <>
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Faça login
          </Link>
        </>
      }
    >
      <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900">
        {queryOrgId ? "Complete seu Cadastro Convidado" : "Crie sua conta"}
      </h2>

      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await loginWithGoogle();
            } catch (error) { /* Erro já deve ser tratado em loginWithGoogle */ }
          }}
          className="w-full"
          disabled={form.formState.isSubmitting} // form com 'f' minúsculo
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

        <Form {...form}> {/* Form com 'F' maiúsculo (componente) */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* form com 'f' minúsculo (instância) */}
            {form.formState.errors.root && ( // form com 'f' minúsculo
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome completo</FormLabel> <FormControl><Input {...field} disabled={!!queryName && !!queryOrgId} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="cpf" render={({ field }) => ( <FormItem> <FormLabel>CPF</FormLabel> <FormControl><Input {...field} placeholder="Digite apenas números" maxLength={11} disabled={!!queryCpf && !!queryOrgId} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="birthDate" render={({ field }) => ( <FormItem> <FormLabel>Data de nascimento</FormLabel> <FormControl><Input {...field} type="date" max={format(new Date(), 'yyyy-MM-dd')} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input {...field} type="email" disabled={!!queryEmail && !!queryOrgId} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="password" render={({ field }) => ( <FormItem> <FormLabel>Senha</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> <p className="text-xs text-gray-500 mt-1">Sua senha deve conter no mínimo 6 caracteres, uma letra maiúscula e um número.</p> </FormItem> )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => ( <FormItem> <FormLabel>Confirme sua senha</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            
            {queryOrgId && (<p className="text-sm text-muted-foreground">Você foi convidado para uma organização. Seus dados (Nome, CPF, Email) foram pré-preenchidos. Por favor, defina sua senha.</p>)}
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}> {/* form com 'f' minúsculo */}
              {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </Form> {/* Form com 'F' maiúsculo */}
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