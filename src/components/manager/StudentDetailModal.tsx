import React from 'react'; // Removido useEffect temporariamente
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User, Mail, CalendarDays, Target } from 'lucide-react'; // Ícones básicos
import { ManagerStudentListItem } from '@/hooks/manager/useManagerStudents';
import { Badge } from '@/components/ui/badge';
// Imports de performance REMOVIDOS temporariamente
// import { useStudentPerformanceData, prefetchStudentPerformance } from '@/hooks/student/useStudentPerformanceData';
// import { PerformanceTopicTable } from '@/components/student/PerformanceTopicTable';

interface StudentDetailModalProps {
  student: ManagerStudentListItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formatDate = (dateString: string | null | undefined): string => {
    // ... (função formatDate sem alterações) ...
    if (!dateString) return 'Data indisponível';
    try {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(dateString));
    } catch (e) {
      console.warn(`Invalid date string received in modal: ${dateString}`);
      return 'Data inválida';
    }
};

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, isOpen, onOpenChange }) => {
  const studentId = student?.id ?? null;

  // Log MUITO SIMPLES para ver se o componente renderiza
  console.log(`[Modal SIMPLIFICADO Render] isOpen: ${isOpen}, studentId: ${studentId}`);

  // REMOVIDA a chamada do hook useStudentPerformanceData por enquanto

  // REMOVIDO o useEffect de prefetch por enquanto

  if (!student) {
    console.log('[Modal SIMPLIFICADO Render] No student, returning null.');
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto"> {/* Voltando largura menor */}
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
             <User className="h-6 w-6" /> Perfil do Aluno
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas, desempenho e progresso do aluno.
          </DialogDescription>
        </DialogHeader>

        {/* Informações Básicas (Mantidas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 border-b pb-6">
            {/* ... Nome, Email, Membro Desde ... */}
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground"/> Nome: <span className="text-sm">{student.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground"/> Email: <span className="text-sm">{student.email}</span>
            </div>
            <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground"/> Membro desde: <span className="text-sm">{formatDate(student.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground"/> Cargo Alvo (Ex): <Badge variant="outline">A definir</Badge>
            </div>
        </div>

        {/* --- TESTE DE RENDERIZAÇÃO SIMPLES --- */}
        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-2">Teste de Conteúdo do Modal</h3>
            <p className="text-green-700 font-bold">Se você está vendo este texto, o conteúdo interno do modal está renderizando!</p>
            <p>ID do Aluno: {student.id}</p>
        </div>
         {/* Placeholders REMOVIDOS temporariamente */}

      </DialogContent>
    </Dialog>
  );
};