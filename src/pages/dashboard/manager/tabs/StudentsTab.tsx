import React, { useState, useMemo } from 'react';
// --- RESTAURANDO/GARANTINDO TODOS OS IMPORTS ---
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, User, Mail, CalendarDays, Target } from 'lucide-react'; // Ícones necessários
import { useManagerStudents, ManagerStudentListItem } from '@/hooks/manager/useManagerStudents'; // Hook e Tipo
import { StudentsTable } from '@/components/manager/StudentsTable'; // Tabela
import { StudentDetailModal } from '@/components/manager/StudentDetailModal'; // Modal

// Função formatDate (pode ir para utils)
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Data indisponível';
    try {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(dateString));
    } catch (e) {
      console.warn(`Invalid date string received: ${dateString}`);
      return 'Data inválida';
    }
};

// Componente da Aba
const StudentsTab: React.FC = () => {
  const { data: students, isLoading, error, refetch, isFetching } = useManagerStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<ManagerStudentListItem | null>(null);

  // Filtro
  const filteredStudents = useMemo(() => {
    if (!students || !searchTerm) return students ?? [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return students.filter(student =>
      student.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.email?.toLowerCase().includes(lowerCaseSearchTerm)
    );
   }, [students, searchTerm]);

  // Handlers do Modal
  const handleViewDetails = (student: ManagerStudentListItem) => {
     console.log("Opening details for:", student);
     setSelectedStudent(student);
   };
   const handleModalOpenChange = (isOpen: boolean) => {
      console.log("[StudentsTab] handleModalOpenChange called with isOpen:", isOpen);
      if (!isOpen) {
        setSelectedStudent(null);
      }
   };

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
            <Button size="sm" disabled>Adicionar Aluno</Button>
        </div>
      </CardHeader>

       {/* Busca */}
      <div className="mb-4">
        <Input
        type="text"
        placeholder="Buscar por nome ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
        />
     </div>

      {/* Tabela */}
      <CardContent className="px-0 pb-0">
        <StudentsTable
        students={filteredStudents}
        isLoading={isLoading}
        error={error}
        onViewDetails={handleViewDetails}
        />
      </CardContent>

      {/* Modal (Renderização Condicional com Children) */}
      {selectedStudent && (
        <StudentDetailModal
          isOpen={true}
          onOpenChange={handleModalOpenChange}
          title="Perfil do Aluno"
          description="Informações detalhadas, desempenho e progresso."
        >
          {/* Conteúdo do Modal */}
          <div className="flex-grow overflow-y-auto pr-2 mt-4 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pb-6 border-b">
                  <div className="flex items-center gap-2"> <User className="h-4 w-4 text-muted-foreground"/> Nome: <span className="text-sm">{selectedStudent.name}</span></div>
                  <div className="flex items-center gap-2"> <Mail className="h-4 w-4 text-muted-foreground"/> Email: <span className="text-sm">{selectedStudent.email}</span></div>
                  <div className="flex items-center gap-2"> <CalendarDays className="h-4 w-4 text-muted-foreground"/> Membro desde: <span className="text-sm">{formatDate(selectedStudent.created_at)}</span></div>
                  <div className="flex items-center gap-2"> <Target className="h-4 w-4 text-muted-foreground"/> Cargo Alvo (Ex): <Badge variant="outline">A definir</Badge></div>
              </div>

              {/* TESTE DE RENDERIZAÇÃO SIMPLES */}
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h3 className="text-lg font-semibold mb-2">Teste de Conteúdo do Modal</h3>
                  <p className="text-green-700 font-bold">Se você está vendo este texto, o conteúdo (children) do modal está renderizando!</p>
                  <p>ID do Aluno: {selectedStudent.id}</p>
              </div>
              {/* TODO: Adicionar placeholders de desempenho aqui quando o teste funcionar */}
          </div>
        </StudentDetailModal>
      )}
    </>
  );
};

export default StudentsTab;