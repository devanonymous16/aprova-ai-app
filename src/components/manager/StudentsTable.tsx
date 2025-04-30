import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ManagerStudentListItem } from '@/hooks/manager/useManagerStudents'; // Importa o tipo
import { Skeleton } from '@/components/ui/skeleton'; // Para o estado de loading
import { AlertCircle, Info } from 'lucide-react'; // Ícones para estados

interface StudentsTableProps {
  students: ManagerStudentListItem[];
  isLoading: boolean;
  error: Error | null;
}

// Componente para exibir estados de erro ou vazio de forma mais visual
const TableStatusDisplay: React.FC<{ icon: React.ElementType; message: string; type: 'error' | 'info' }> = ({ icon: Icon, message, type }) => (
  <div className={`flex flex-col items-center justify-center p-10 text-center border rounded-md ${type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-muted-foreground'}`}>
    <Icon className={`h-12 w-12 mb-4 ${type === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
    <p>{message}</p>
  </div>
);

export const StudentsTable: React.FC<StudentsTableProps> = ({ students, isLoading, error }) => {

  // Estado de Carregamento com Skeletons
  if (isLoading) {
    return (
      <div className="border rounded-md">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead className="w-[250px]">Nome</TableHead>
               <TableHead>Email</TableHead>
               <TableHead className="w-[150px]">Data de Cadastro</TableHead>
               <TableHead className="text-right w-[100px]">Ações</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {[...Array(5)].map((_, index) => ( // Exibe 5 linhas de skeleton
               <TableRow key={index}>
                 <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                 <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                 <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                 <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <TableStatusDisplay
        icon={AlertCircle}
        message={`Erro ao carregar alunos: ${error.message}`}
        type="error"
      />
    );
  }

  // Estado Vazio (Nenhum aluno encontrado)
  if (!students || students.length === 0) {
    return (
       <TableStatusDisplay
         icon={Info}
         message="Nenhum aluno encontrado para esta instituição."
         type="info"
       />
    );
  }

  // Formata a data para exibição
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Data indisponível';
    try {
      // Tenta criar a data e formatar
      return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
    } catch (e) {
      // Se a string não for um formato de data válido
      console.warn(`Invalid date string received: ${dateString}`);
      return 'Data inválida';
    }
  };

  // Renderiza a tabela com os dados
  return (
    <div className="border rounded-md">
      <Table>
        <TableCaption>Lista de alunos da sua instituição.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[150px]">Data de Cadastro</TableHead>
            {/* Placeholder para futuras ações */}
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{formatDate(student.created_at)}</TableCell>
              {/* Placeholder para botão de detalhes/edição */}
              <TableCell className="text-right">
                 {/* Usar Button de shadcn/ui para consistência */}
                <button
                  onClick={() => console.log(`Abrir detalhes para aluno ID: ${student.id}`)} // Ação placeholder no console
                  className="text-sm font-medium text-primary-600 hover:text-primary-800" // Estilo inline simples
                >
                  Detalhes
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};