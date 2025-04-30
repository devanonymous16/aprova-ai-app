import React, { useState, useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useManagerStudents, ManagerStudentListItem } from '@/hooks/manager/useManagerStudents'; // Importa o tipo
import { StudentsTable } from '@/components/manager/StudentsTable';
import { Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { StudentDetailModal } from '@/components/manager/StudentDetailModal'; // <<-- IMPORTA O MODAL

const StudentsTab: React.FC = () => {
  const { data: students, isLoading, error, refetch, isFetching } = useManagerStudents();
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADO PARA O MODAL ---
  const [selectedStudent, setSelectedStudent] = useState<ManagerStudentListItem | null>(null);
  const isModalOpen = !!selectedStudent; // Modal está aberto se houver um aluno selecionado

  // Filtro (sem alterações)
  const filteredStudents = useMemo(() => {
    if (!students || !searchTerm) return students ?? [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return students.filter(student =>
      student.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.email?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [students, searchTerm]);

  // --- FUNÇÃO PARA ABRIR O MODAL ---
  const handleViewDetails = (student: ManagerStudentListItem) => {
    console.log("Opening details for:", student); // Log para debug
    setSelectedStudent(student); // Define o aluno selecionado, o que abrirá o modal
  };

  // --- FUNÇÃO PARA FECHAR O MODAL (Chamada pelo onOpenChange do Dialog) ---
   const handleModalOpenChange = (isOpen: boolean) => {
     if (!isOpen) {
       setSelectedStudent(null); // Limpa o aluno selecionado quando o modal fecha
     }
     // Se isOpen for true, não fazemos nada aqui, pois handleViewDetails já definiu o aluno
   };

  return (
    <>
      {/* Cabeçalho (sem alterações) */}
      <CardHeader className="px-0 pt-0 pb-4 mb-4 border-b flex flex-row items-center justify-between">
        {/* ... título e botões ... */}
        <div className="flex items-center gap-3">
             <Users className="h-6 w-6 text-primary-800" />
             <CardTitle className="text-xl">Gerenciamento de Alunos</CardTitle>
        </div>
       <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Atualizando...' : 'Atualizar Lista'}
            </Button>
            <Button size="sm" disabled>Adicionar Aluno</Button>
       </div>
      </CardHeader>

       {/* Área de Busca (sem alterações) */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Conteúdo Principal (Tabela) */}
      <CardContent className="px-0 pb-0">
        {/* Passa a função handleViewDetails para a tabela */}
        <StudentsTable
          students={filteredStudents}
          isLoading={isLoading}
          error={error}
          onViewDetails={handleViewDetails} // <<-- PASSA A FUNÇÃO AQUI
        />
      </CardContent>

      {/* --- RENDERIZAÇÃO DO MODAL --- */}
      {/* O modal só será efetivamente renderizado quando 'isModalOpen' for true */}
      {/* Passamos o aluno selecionado e a função para lidar com a mudança de estado (fechamento) */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onOpenChange={handleModalOpenChange}
      />
    </>
  );
};

export default StudentsTab;