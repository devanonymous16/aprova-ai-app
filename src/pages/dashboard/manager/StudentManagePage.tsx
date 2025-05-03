// src/pages/dashboard/manager/StudentManagePage.tsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Para exibir avatar
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Para estruturar
import { useStudentDetails } from '@/hooks/manager/useStudentDetails'; // <<-- IMPORTA O NOVO HOOK
import EditStudentForm from '@/components/manager/EditStudentForm'; // <<-- IMPORTAR FORMULÁRIO

// Helper para iniciais (pode ir para utils)
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
};

// Helper para formatar data (pode ir para utils)
const formatDate = (dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'Não informado';
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeZone: 'UTC' }; // Usar UTC para datas puras
    return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(new Date(dateString));
  } catch (e) {
    console.warn(`Invalid date string received: ${dateString}`);
    return 'Data inválida';
  }
};


export default function StudentManagePage() {
  const { studentId } = useParams<{ studentId: string }>();

  // --- USA O HOOK PARA BUSCAR OS DADOS ---
  const { data: studentDetails, isLoading, error, status } = useStudentDetails(studentId);

  useEffect(() => {
    // Atualiza título da página quando os dados carregam
    if (studentDetails?.profile_name) {
       document.title = `Gerenciar ${studentDetails.profile_name} | Forefy`;
    } else if (studentId) {
        document.title = `Gerenciar Aluno (${studentId.substring(0, 8)}...) | Forefy`;
    } else {
        document.title = `Gerenciar Aluno | Forefy`;
    }
  }, [studentDetails, studentId]);

  console.log('Renderizando StudentManagePage para ID:', studentId, 'Status da Query:', status);

  // --- RENDERIZAÇÃO CONDICIONAL ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-900" />
          <span className="ml-3 text-muted-foreground">Carregando dados do aluno...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 border border-red-200 rounded-md p-6">
          <AlertTriangle className="h-10 w-10 mb-3 text-red-500" />
          <p className="font-semibold text-lg mb-1">Erro ao buscar dados</p>
          <p className="text-sm text-center">{error.message}</p>
        </div>
      );
    }

    if (!studentDetails) {
       return (
         <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-gray-50 border rounded-md p-6">
            <UserCircle className="h-10 w-10 mb-3 text-gray-400"/>
            <p className="font-semibold text-lg">Aluno não encontrado</p>
            <p className="text-sm text-center">O aluno com este ID não foi encontrado ou você não tem permissão para visualizá-lo.</p>
         </div>
       );
    }

      // Se chegou aqui, temos os dados!
      return (
        <div className="space-y-6"> {/* Adiciona espaço entre cards */}
          {/* Card de Informações (Display) */}
          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              {/* ... Avatar, Nome, Email, Badge ... */}
               <Avatar className="h-16 w-16 border"> {/* ... */} </Avatar>
               <div className="flex-grow"> {/* ... */} </div>
               {/* Removido o botão Editar daqui, ficará no form */}
            </CardHeader>
            <CardContent className="mt-4">
               <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informações Cadastrais</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                 {/* Exibe os dados não editáveis ou como referência */}
                 <div><span className="font-medium text-gray-500 block mb-1">Data Nasc (Exibição):</span> <span>{formatDate(studentDetails.student_date_of_birth)}</span></div>
                 <div><span className="font-medium text-gray-500 block mb-1">Telefone (Exibição):</span> <span>{studentDetails.student_phone_number || 'Não informado'}</span></div>
                 <div><span className="font-medium text-gray-500 block mb-1">CPF:</span> <span>{studentDetails.profile_cpf || 'Não informado'}</span></div>
                 <div><span className="font-medium text-gray-500 block mb-1">Responsável:</span> <span>{studentDetails.student_guardian_name || 'N/A'}</span></div>
                 <div><span className="font-medium text-gray-500 block mb-1">Função:</span> <span className="capitalize">{studentDetails.profile_role ?? 'N/A'}</span></div>
                 <div><span className="font-medium text-gray-500 block mb-1">Membro Desde:</span> <span>{formatDate(studentDetails.profile_created_at, {dateStyle: 'medium', timeStyle: 'short'})}</span></div>
               </div>
            </CardContent>
          </Card>
  
          {/* --- Card de Edição --- */}
          <Card>
             <CardHeader>
                <CardTitle>Editar Informações</CardTitle>
                {/* <CardDescription>Ajuste os dados cadastrais do aluno.</CardDescription> */}
             </CardHeader>
             <CardContent>
                {/* Renderiza o formulário passando os detalhes */}
                <EditStudentForm studentDetails={studentDetails} />
             </CardContent>
          </Card>
        </div>
      );
    };
  
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ... Botão Voltar ... */}
         <div className="mb-6">
            <Link to="/dashboard/manager" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Alunos
            </Link>
         </div>
        {/* Renderiza o conteúdo */}
        {renderContent()}
      </div>
    );
  }