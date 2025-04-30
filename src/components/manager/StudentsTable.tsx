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
import { ManagerStudentListItem } from '@/hooks/manager/useManagerStudents';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Info, Eye } from 'lucide-react'; // Adicionado Eye para ícone
import { Button } from '@/components/ui/button'; // Importado Button

interface StudentsTableProps {
  students: ManagerStudentListItem[];
  isLoading: boolean;
  error: Error | null;
  onViewDetails: (student: ManagerStudentListItem) => void; // <<-- NOVA PROP: Função para chamar ao clicar em detalhes
}

// Componente TableStatusDisplay (sem alterações)
const TableStatusDisplay: React.FC<{ icon: React.ElementType; message: string; type: 'error' | 'info' }> = ({ icon: Icon, message, type }) => (
    <div className={`flex flex-col items-center justify-center p-10 text-center border rounded-md ${type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-muted-foreground'}`}>
      <Icon className={`h-12 w-12 mb-4 ${type === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
      <p>{message}</p>
    </div>
  );

export const StudentsTable: React.FC<StudentsTableProps> = ({ students, isLoading, error, onViewDetails }) => { // <<-- Adicionada prop onViewDetails

  // Estado de Carregamento (sem alterações)
  if (isLoading) {
    return (
      <div className="border rounded-md">
         {/* ... Skeletons ... */}
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead className="w-[35%]">Nome</TableHead>
               <TableHead>Email</TableHead>
               <TableHead className="w-[150px]">Data de Cadastro</TableHead>
               <TableHead className="text-right w-[100px]">Ações</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {[...Array(5)].map((_, index) => (
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

  // Estado de Erro (sem alterações)
  if (error) {
    return <TableStatusDisplay icon={AlertCircle} message={`Erro ao carregar alunos: ${error.message}`} type="error"/>;
  }

  // Estado Vazio (sem alterações)
  if (!students || students.length === 0) {
    return <TableStatusDisplay icon={Info} message="Nenhum aluno encontrado para esta instituição." type="info"/>;
  }

  // Formata a data (sem alterações)
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Data indisponível';
    try {
      return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
    } catch (e) {
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
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{formatDate(student.created_at)}</TableCell>
              <TableCell className="text-right">
                {/* --- BOTÃO MODIFICADO --- */}
                <Button
                  variant="ghost" // Aparência mais sutil
                  size="sm"       // Tamanho pequeno
                  onClick={() => onViewDetails(student)} // <<-- CHAMA A FUNÇÃO PASSADA COM O OBJETO student
                  className="text-primary-600 hover:text-primary-800 px-2" // Ajuste de espaçamento
                >
                  <Eye className="h-4 w-4 mr-1" /> {/* Ícone */}
                  Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};