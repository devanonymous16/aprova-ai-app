// src/pages/dashboard/manager/StudentManagePage.tsx
import React, { useEffect, useState } from 'react'; // Adicionado useState
import { useParams, Link, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import { ArrowLeft, UserCircle, Loader2, AlertTriangle, CheckCircle2, XCircle, Trash2 } from 'lucide-react'; // Adicionado Trash2
import { useQueryClient, useMutation } from '@tanstack/react-query'; // Adicionado imports
import { supabase } from '@/integrations/supabase/client'; // Importa supabase client

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Adicionado CardDescription
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Imports do Alert Dialog
import { toast } from "sonner"; // Para feedback

import { useStudentDetails } from '@/hooks/manager/useStudentDetails';
import EditStudentForm from '@/components/manager/EditStudentForm';

// Helper para iniciais (Garantindo retorno)
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '??';
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return initials || '??'; // <<-- GARANTE RETORNO
};

// Helper para formatar data (Garantindo retorno)
const formatDate = (dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) {
      return 'Não informado'; // <<-- GARANTE RETORNO
  }
  try {
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'Z');
    if (isNaN(date.getTime())) {
        console.warn(`Invalid date string passed to formatDate: ${dateString}`);
        return 'Data inválida'; // <<-- GARANTE RETORNO
    }
    const defaultOptions: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeZone: 'UTC' };
    if (options?.timeStyle) {
       defaultOptions.timeZone = undefined;
    }
    return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(date);
  } catch (e) {
    console.error(`Error formatting date string: ${dateString}`, e);
    return 'Erro ao formatar'; // <<-- GARANTE RETORNO
  }
};


export default function StudentManagePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: studentDetails, isLoading, error, status } = useStudentDetails(studentId);

  useEffect(() => {
    if (studentDetails?.profile_name) {
       document.title = `Gerenciar ${studentDetails.profile_name} | Forefy`;
    } else if (studentId) {
        document.title = `Gerenciar Aluno (${studentId.substring(0, 8)}...) | Forefy`;
    } else {
        document.title = `Gerenciar Aluno | Forefy`;
    }
  }, [studentDetails, studentId]);

  console.log('Renderizando StudentManagePage para ID:', studentId, 'Status da Query:', status);

  // Lógica de Exclusão (sem alterações)
  const { mutate: deleteStudent, isPending: isDeleting } = useMutation({
    mutationFn: async () => { /* ... (código da mutationFn igual) ... */
        if (!studentId) throw new Error("ID do aluno inválido.");
        console.log(`[Delete Mutation] Chamando RPC para excluir aluno ${studentId}`);
        const { data, error: rpcError } = await supabase.rpc('delete_student_from_org_by_manager', {
            p_student_id: studentId
        });
        if (rpcError) throw rpcError;
        console.log("[Delete Mutation] RPC Sucesso:", data);
        return data;
    },
    onSuccess: (data) => { /* ... (código onSuccess igual) ... */
        toast.success("Aluno removido da organização com sucesso!", { description: data as string | undefined });
        queryClient.invalidateQueries({ queryKey: ['managerStudents'] });
        queryClient.removeQueries({ queryKey: ['studentDetails', studentId] });
        navigate('/dashboard/manager');
    },
    onError: (error: any) => { /* ... (código onError igual) ... */
         toast.error("Falha ao remover aluno.", {
            description: error.message || 'Ocorreu um erro inesperado.',
        });
    },
  });


  // --- Renderização Condicional CORRIGIDA ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-900" />
          <span className="ml-3 text-muted-foreground">Carregando dados do aluno...</span>
        </div>
      ); // <<-- Fechamento correto do bloco JSX
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 border border-red-200 rounded-md p-6">
          <AlertTriangle className="h-10 w-10 mb-3 text-red-500" />
          <p className="font-semibold text-lg mb-1">Erro ao buscar dados</p>
          <p className="text-sm text-center">{error.message}</p>
        </div>
      ); // <<-- Fechamento correto do bloco JSX
    }

    if (!studentDetails) {
       return (
         <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-gray-50 border rounded-md p-6">
            <UserCircle className="h-10 w-10 mb-3 text-gray-400"/>
            <p className="font-semibold text-lg">Aluno não encontrado</p>
            <p className="text-sm text-center">O aluno com este ID não foi encontrado ou você não tem permissão para visualizá-lo.</p>
         </div>
       ); // <<-- Fechamento correto do bloco JSX
    }

    // Se temos dados...
    return (
      <div className="space-y-6">
        {/* Card Superior: Identificação */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={studentDetails.profile_avatar_url ?? undefined} alt={studentDetails.profile_name ?? 'Avatar'} />
              <AvatarFallback className="text-xl font-semibold">
                {getInitials(studentDetails.profile_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <CardTitle className="text-2xl mb-1">{studentDetails.profile_name ?? 'Nome não disponível'}</CardTitle>
              <p className="text-sm text-muted-foreground">{studentDetails.profile_email ?? 'Email não disponível'}</p>
            </div>
            {/* Botão Excluir com AlertDialog */}
            <AlertDialog>
               <AlertDialogTrigger asChild>
                   <Button variant="destructive" size="sm" disabled={isDeleting}>
                       <Trash2 className="h-4 w-4 mr-1" />
                       Excluir Aluno
                   </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                   <AlertDialogHeader>
                   <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                   <AlertDialogDescription>
                       Tem certeza que deseja remover o aluno <span className='font-medium'>{studentDetails.profile_name ?? 'este aluno'}</span> da organização? Esta ação não pode ser desfeita facilmente.
                   </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                   <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                   <AlertDialogAction onClick={() => deleteStudent()} disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                   </AlertDialogAction>
                   </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
          </CardHeader> {/* <<-- Fechamento correto do CardHeader */}
          <CardContent className="mt-1">
            <h3 className="text-base font-semibold mb-3 border-b pb-1 text-muted-foreground">Informações Gerais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {/* Status Confirmado */}
              <div>
                  <span className="font-medium text-gray-500 block mb-1">Status Cadastro:</span>
                  <Badge
                    variant={"outline"}
                    className={`border-2 ${
                      studentDetails.student_confirmed
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-red-500 bg-red-50 text-red-800 font-medium'
                    }`}
                  >
                     {studentDetails.student_confirmed
                        ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1"/>Confirmado</>
                        : <><XCircle className="h-3.5 w-3.5 mr-1"/>Não Confirmado</>
                     }
                  </Badge>
              </div>
              {/* Outros campos */}
              <div><span className="font-medium text-gray-500 block">CPF:</span> <span>{studentDetails.profile_cpf || 'Não informado'}</span></div>
              <div><span className="font-medium text-gray-500 block">Responsável:</span> <span>{studentDetails.student_guardian_name || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-500 block">Função:</span> <span className="capitalize">{studentDetails.profile_role ?? 'N/A'}</span></div>
              <div><span className="font-medium text-gray-500 block">Membro Desde:</span> <span>{formatDate(studentDetails.profile_created_at, {dateStyle: 'medium', timeStyle: 'short'})}</span></div>
            </div>
          </CardContent>
        </Card> {/* <<-- Fechamento correto do primeiro Card */}

        {/* Card Inferior: Formulário de Edição */}
        <Card>
           <CardHeader>
              <CardTitle>Editar Informações</CardTitle>
              <CardDescription>Ajuste os dados cadastrais editáveis do aluno.</CardDescription>
           </CardHeader>
           <CardContent>
              <EditStudentForm
                  studentDetails={studentDetails}
                  studentId={studentId!}
              />
           </CardContent>
        </Card> {/* <<-- Fechamento correto do segundo Card */}
      </div> // <<-- Fechamento correto do div space-y-6
    ); // <<-- Fechamento correto do return principal
  }; // <<-- Fechamento correto da função renderContent

  // Renderização principal da página
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Botão Voltar */}
      <div className="mb-6">
         <Link to="/dashboard/manager" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
           <ArrowLeft className="h-4 w-4 mr-1" />
           Voltar para Alunos
         </Link>
       </div>
       {renderContent()}
    </div>
  ); // <<-- Fechamento correto do return principal
} // <<-- Fechamento correto do componente