import React, { useState, useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useManagerStudents, ManagerStudentListItem } from '@/hooks/manager/useManagerStudents';
import { StudentsTable } from '@/components/manager/StudentsTable';
import { Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { StudentDetailModal } from '@/components/manager/StudentDetailModal'; // Importa a versão SIMPLIFICADA

const StudentsTab: React.FC = () => {
  const { data: students, isLoading, error, refetch, isFetching } = useManagerStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<ManagerStudentListItem | null>(null);

  // Lógica de filtro (sem alterações)
  const filteredStudents = useMemo(() => {
    // ... (código do filtro igual) ...
    if (!students || !searchTerm) return students ?? [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return students.filter(student =>
      student.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.email?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [students, searchTerm]);

  // Função para abrir modal (sem alterações)
  const handleViewDetails = (student: ManagerStudentListItem) => {
    console.log("Opening details for:", student);
    setSelectedStudent(student);
  };

  // Função para fechar modal (sem alterações)
   const handleModalOpenChange = (isOpen: boolean) => {
     console.log("[StudentsTab] handleModalOpenChange called with isOpen:", isOpen);
     if (!isOpen) {
       setSelectedStudent(null);
     }
   };

  return (
    <>
      {/* Cabeçalho (sem alterações) */}
      <CardHeader className="px-0 pt-0 pb-4 mb-4 border-b flex flex-row items-center justify-between">
         {/* ... */}
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

      {/* Tabela (sem alterações) */}
      <CardContent className="px-0 pb-0">
        <StudentsTable
          students={filteredStudents}
          isLoading={isLoading}
          error={error}
          onViewDetails={handleViewDetails}
        />
      </CardContent>

      {/* --- RENDERIZAÇÃO MODIFICADA DO MODAL --- */}
      {/* Renderiza o componente Modal APENAS se selectedStudent não for null */}
      {/* A prop 'isOpen' é controlada internamente pelo Dialog quando montado */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          isOpen={true} // Sempre passa true quando montado
          onOpenChange={handleModalOpenChange} // Ainda necessário para detectar fechamento
        />
      )}
    </>
  );
};

export default StudentsTab;