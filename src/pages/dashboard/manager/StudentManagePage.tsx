// src/pages/dashboard/manager/StudentManagePage.tsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Loader2, AlertTriangle } from 'lucide-react'; // Adicionamos UserCircle aqui também
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Adicionado CardDescription
import { useStudentDetails } from '@/hooks/manager/useStudentDetails';
import EditStudentForm from '@/components/manager/EditStudentForm'; // Importa o formulário

// Helpers (getInitials, formatDate)
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
};
const formatDate = (dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'Não informado';
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeZone: 'UTC' };
    // Se precisar de hora, ajuste as opções ou remova timeZone
    if (options?.timeStyle) {
       defaultOptions.timeZone = undefined; // Deixa o navegador/sistema decidir o fuso horário local para hora
    }
    return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(new Date(dateString));
  } catch (e) {
    // Verifica se é uma data válida antes de logar
    if(dateString && new Date(dateString).toString() === "Invalid Date") {
        console.warn(`Invalid date string received: ${dateString}`);
        return 'Data inválida';
    }
    return 'Não informado'; // Retorna se for null/undefined ou falhar silenciosamente
  }
};

export default function StudentManagePage() {
  const { studentId } = useParams<{ studentId: string }>();
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

  const renderContent = () => {
    if (isLoading) {
      return ( /* ... loading UI ... */
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-900" />
          <span className="ml-3 text-muted-foreground">Carregando dados do aluno...</span>
        </div>
      );
    }
    if (error) {
      return ( /* ... error UI ... */
        <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 border border-red-200 rounded-md p-6">
          <AlertTriangle className="h-10 w-10 mb-3 text-red-500" />
          <p className="font-semibold text-lg mb-1">Erro ao buscar dados</p>
          <p className="text-sm text-center">{error.message}</p>
        </div>
      );
    }
    if (!studentDetails) {
       return ( /* ... not found UI ... */
         <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-gray-50 border rounded-md p-6">
            <UserCircle className="h-10 w-10 mb-3 text-gray-400"/>
            <p className="font-semibold text-lg">Aluno não encontrado</p>
            <p className="text-sm text-center">O aluno com este ID não foi encontrado ou você não tem permissão para visualizá-lo.</p>
         </div>
       );
    }

    // --- Se temos dados, renderiza os Cards ---
    return (
      <div className="space-y-6"> {/* Envolve os dois cards */}
        {/* --- Card Superior: Informações de Exibição --- */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            {/* Avatar */}
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={studentDetails.profile_avatar_url ?? undefined} alt={studentDetails.profile_name ?? 'Avatar'} />
              <AvatarFallback className="text-xl font-semibold">
                {getInitials(studentDetails.profile_name)}
              </AvatarFallback>
            </Avatar>
            {/* Nome, Email, Status */}
            <div className="flex-grow">
              <CardTitle className="text-2xl mb-1">{studentDetails.profile_name ?? 'Nome não disponível'}</CardTitle>
              <p className="text-sm text-muted-foreground">{studentDetails.profile_email ?? 'Email não disponível'}</p>
              <Badge
                variant={studentDetails.student_confirmed ? "outline" : "secondary"}
                className={`mt-2 ${
                  studentDetails.student_confirmed
                    ? 'border-green-500 text-green-700 dark:border-green-700 dark:text-green-400'
                    : 'border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400'
                }`}
              >
                {studentDetails.student_confirmed ? 'Confirmado' : 'Não Confirmado'}
              </Badge>
            </div>
            {/* Botão de ação (pode ser movido para o form) */}
            {/* <Button variant="secondary" disabled>Ações...</Button> */}
          </CardHeader>
          {/* Conteúdo do Card Superior: Dados Não Editáveis */}
          <CardContent className="mt-4">
            <h3 className="text-base font-semibold mb-3 border-b pb-1 text-muted-foreground">Informações Gerais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {/* Campos que NÃO estão no formulário de edição */}
              <div><span className="font-medium text-gray-500 block">CPF:</span> <span>{studentDetails.profile_cpf || 'Não informado'}</span></div>
              <div><span className="font-medium text-gray-500 block">Responsável:</span> <span>{studentDetails.student_guardian_name || 'N/A'}</span></div>
              <div><span className="font-medium text-gray-500 block">Função:</span> <span className="capitalize">{studentDetails.profile_role ?? 'N/A'}</span></div>
              <div><span className="font-medium text-gray-500 block">Membro Desde:</span> <span>{formatDate(studentDetails.profile_created_at, {dateStyle: 'medium', timeStyle: 'short'})}</span></div>
              {/* Adicionar mais campos de exibição aqui se necessário */}
            </div>
          </CardContent>
        </Card>
           {/* --- Card Inferior: Formulário de Edição --- */}
           <Card>
              <CardHeader>
                 <CardTitle>Editar Informações</CardTitle>
                 <CardDescription>Ajuste os dados cadastrais editáveis do aluno.</CardDescription>
              </CardHeader>
              <CardContent>
                 {/* Renderiza o formulário passando os detalhes E O ID */}
                 <EditStudentForm
                     studentDetails={studentDetails}
                     studentId={studentId!} // <<-- Passa o ID (usamos ! pois já verificamos que studentDetails existe)
                 />
              </CardContent>
           </Card>
      </div>
    );
  }; // Fim da função renderContent

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
       {/* Renderiza loading, erro, not found ou os cards */}
       {renderContent()}
    </div>
  );
}