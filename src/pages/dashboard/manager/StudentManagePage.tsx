// src/pages/dashboard/manager/StudentManagePage.tsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Para botão de voltar

export default function StudentManagePage() {
  // Captura o ID do aluno da URL
  const { studentId } = useParams<{ studentId: string }>();

  useEffect(() => {
    // Define o título da página (exemplo)
    document.title = `Gerenciar Aluno ${studentId ? `(${studentId.substring(0, 8)}...)` : ''} | Forefy`;
  }, [studentId]);

  // TODO: Adicionar hook para buscar dados detalhados do aluno usando studentId
  // const { data: studentDetails, isLoading, error } = useStudentDetails(studentId);

  console.log('Renderizando StudentManagePage para ID:', studentId);

  // Simplesmente exibe o ID por enquanto para confirmar que funciona
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
         {/* Link para voltar para a lista de alunos */}
         <Link to="/dashboard/manager" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
           <ArrowLeft className="h-4 w-4 mr-1" />
           Voltar para Alunos
         </Link>
       </div>

      <h1 className="text-2xl font-bold font-heading mb-2">Gerenciar Aluno</h1>
      <p className="text-muted-foreground mb-6">Editando informações para o aluno com ID: <span className="font-mono bg-gray-100 px-1 rounded">{studentId ?? 'ID não encontrado'}</span></p>

      {/* Placeholder para o conteúdo futuro (formulário, etc.) */}
      <div className="p-10 border rounded-lg bg-gray-50 text-center">
         <p className="text-muted-foreground">
           Placeholder: Formulário de edição e outras opções de gerenciamento aparecerão aqui.
         </p>
         {/* Exemplo: {isLoading && <p>Carregando dados do aluno...</p>} */}
         {/* Exemplo: {error && <p className="text-red-500">Erro: {error.message}</p>} */}
         {/* Exemplo: {studentDetails && <EditStudentForm student={studentDetails} />} */}
      </div>

    </div>
  );
}