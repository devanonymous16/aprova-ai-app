import React, { useState, useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useManagerStudents, ManagerStudentListItem } from '@/hooks/manager/useManagerStudents';
import { StudentsTable } from '@/components/manager/StudentsTable';
import { Users, RefreshCw, User, Mail, CalendarDays, Target } from 'lucide-react'; // Ícones para o teste
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge'; // Para o teste
// import { StudentDetailModal } from '@/components/manager/StudentDetailModal'; // REMOVIDO

// Função formatDate (mantida)
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Data indisponível';
    try {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(dateString));
    } catch (e) {
      console.warn(`Invalid date string received: ${dateString}`);
      return 'Data inválida';
    }
};

const StudentsTab: React.FC = () => {
  const { data: students, isLoading, error, refetch, isFetching } = useManagerStudents();
  const [searchTerm, setSearchTerm] = useState('');
  // Mantém o estado para sabermos QUANDO mostrar o conteúdo de teste
  const [selectedStudent, setSelectedStudent] = useState<ManagerStudentListItem | null>(null);

  // Filtro (sem alterações)
  const filteredStudents = useMemo(() => { /* ... */
    if (!students || !searchTerm) return students ?? [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return students.filter(student =>
      student.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.email?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [students, searchTerm]);

  // Handler para selecionar (sem alterações)
  const handleViewDetails = (student: ManagerStudentListItem) => {
     console.log("Opening details test for:", student);
     setSelectedStudent(student);
   };
   // Handler para "fechar" (limpar seleção) - pode ser ligado a um botão de teste
   const handleCloseDetailsTest = () => {
     console.log("Closing details test.");
     setSelectedStudent(null);
   };

  return (
    <>
      {/* Cabeçalho, Busca, Tabela (sem alterações) */}
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
       <div className="mb-4">
         <Input
             type="text"
             placeholder="Buscar por nome ou email..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="max-w-sm"
         />
       </div>
       <CardContent className="px-0 pb-0">
         <StudentsTable
             students={filteredStudents}
             isLoading={isLoading}
             error={error}
             onViewDetails={handleViewDetails} // Continua chamando para setar selectedStudent
         />
       </CardContent>

       {/* --- TESTE DE RENDERIZAÇÃO DIRETA --- */}
       {/* Mostra este bloco diretamente se um aluno estiver selecionado */}
       {selectedStudent && (
         <div className="mt-6 p-6 border-4 border-dashed border-red-500 bg-red-50">
             <h2 className="text-2xl font-bold text-red-800 mb-4">Bloco de Teste Direto (StudentsTab)</h2>
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 border-b pb-6 border-red-200">
                  <div className="flex items-center gap-2"> <User className="h-4 w-4"/> Nome: <span className="font-semibold">{selectedStudent.name}</span></div>
                  <div className="flex items-center gap-2"> <Mail className="h-4 w-4"/> Email: <span className="font-semibold">{selectedStudent.email}</span></div>
                  <div className="flex items-center gap-2"> <CalendarDays className="h-4 w-4"/> Membro desde: <span className="font-semibold">{formatDate(selectedStudent.created_at)}</span></div>
                  <div className="flex items-center gap-2"> <Target className="h-4 w-4"/> Cargo Alvo (Ex): <Badge variant="secondary">A definir</Badge></div>
              </div>
             <p className="text-lg text-red-700">Se este bloco vermelho aparecer, a lógica de estado em StudentsTab está OK, mas a renderização do componente Modal (seja shadcn ou nativo) está falhando no ambiente.</p>
             <Button onClick={handleCloseDetailsTest} variant="destructive" className="mt-4">Fechar Teste</Button>
         </div>
       )}
    </>
  );
};

export default StudentsTab;