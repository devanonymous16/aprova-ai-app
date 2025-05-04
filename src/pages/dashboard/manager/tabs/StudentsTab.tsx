import React, { useState, useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useManagerStudents, ManagerStudentListItem } from '@/hooks/manager/useManagerStudents'; // Importa o tipo
import { StudentsTable } from '@/components/manager/StudentsTable';
import { Users, RefreshCw, UserPlus } from 'lucide-react'; // Ajustado Icon Imports
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
// import { Badge } from '@/components/ui/badge'; // Badge não é mais usada aqui diretamente
import AddStudentDialog from '@/components/manager/AddStudentDialog'; // Importa o novo dialog

// Função formatDate (CORRIGIDA PARA GARANTIR RETORNO)
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Data indisponível'; // Retorno para null/undefined
    try {
      // Tenta criar e validar a data
      const date = new Date(dateString.includes('T') ? dateString : dateString + 'Z');
      if (isNaN(date.getTime())) {
         console.warn(`Invalid date string passed to formatDate: ${dateString}`);
         return 'Data inválida'; // Retorno para data inválida
      }
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
    } catch (e) {
      console.error(`Error formatting date string: ${dateString}`, e);
      return 'Erro ao formatar'; // Retorno para exceção
    }
};


const StudentsTab: React.FC = () => {
  const { data: students, isLoading, error, refetch, isFetching } = useManagerStudents();
  const [searchTerm, setSearchTerm] = useState('');
  // REMOVIDO o estado selectedStudent e handlers relacionados ao teste direto
  // const [selectedStudent, setSelectedStudent] = useState<ManagerStudentListItem | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

    // Filtro (Refinado para garantir tipo Array)
    const filteredStudents = useMemo(() => {
      // 1. Garante que 'students' seja tratado como um array ou array vazio.
      const studentList: ManagerStudentListItem[] = Array.isArray(students) ? students : [];
  
      // 2. Se não houver termo de busca, retorna a lista (agora garantidamente um array)
      if (!searchTerm) {
        return studentList;
      }
  
      // 3. Converte termo de busca
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
      // 4. Filtra o array garantido
      return studentList.filter(student =>
        (student.name?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (student.email?.toLowerCase().includes(lowerCaseSearchTerm))
      );
     }, [students, searchTerm]); // Dependências corretas

  // REMOVIDOS os handlers handleViewDetails e handleCloseDetailsTest

  return (
    <>
      {/* Cabeçalho */}
      <CardHeader className="px-0 pt-0 pb-4 mb-4 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary-800" />
            <CardTitle className="text-xl">Gerenciamento de Alunos</CardTitle>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Atualizando...' : 'Atualizar Lista'}
            </Button>
            {/* Botão Adicionar Aluno */}
            <Button size="sm" onClick={() => setIsAddStudentModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Aluno
            </Button>
        </div>
       </CardHeader> {/* <<-- Fechamento correto do CardHeader */}

       {/* Busca */}
       <div className="mb-4">
         <Input
             type="text"
             placeholder="Buscar por nome ou email..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="max-w-sm"
         />
       </div> {/* <<-- Fechamento correto do div */}

       {/* Tabela */}
       <CardContent className="px-0 pb-0">
         <StudentsTable
             students={filteredStudents} // Passa a lista filtrada (sempre um array)
             isLoading={isLoading}
             error={error}
             // Não passa mais onViewDetails
         />
       </CardContent> {/* <<-- Fechamento correto do CardContent */}

      {/* REMOVIDO o bloco de teste direto que estava aqui */}

      {/* Renderiza o Modal de Adição */}
      <AddStudentDialog
          isOpen={isAddStudentModalOpen}
          onOpenChange={setIsAddStudentModalOpen}
          // onStudentAdded={() => refetch()} // Descomentar no futuro para refresh automático
      />
    </> // <<-- Fechamento correto do Fragment
  ); // <<-- Fechamento correto do return
}; // <<-- Fechamento correto do componente

export default StudentsTab;