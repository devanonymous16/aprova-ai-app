import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User, Mail, CalendarDays, BarChartHorizontal, Users, Target, AlertTriangle, Loader2, ServerCrash } from 'lucide-react';
import { ManagerStudentListItem } from '@/hooks/manager/useManagerStudents';
import { Badge } from '@/components/ui/badge';
import { useStudentPerformanceData, prefetchStudentPerformance } from '@/hooks/student/useStudentPerformanceData';
import { PerformanceTopicTable } from '@/components/student/PerformanceTopicTable';

interface StudentDetailModalProps {
  student: ManagerStudentListItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formatDate = (dateString: string | null | undefined): string => {
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
  const mockExamPositionId = 'pos-123-abc';

  console.log('[Modal Render] isOpen:', isOpen, 'studentId:', studentId);

  const {
      data: performanceData,
      isLoading: isLoadingPerformance,
      error: errorPerformance,
      status: performanceStatus,
  } = useStudentPerformanceData(studentId, mockExamPositionId);

  console.log('[Modal Performance Hook State]', {
      studentId,
      mockExamPositionId,
      status: performanceStatus,
      isLoadingPerformance,
      errorPerformance: errorPerformance ? errorPerformance.message : null,
      performanceDataLength: performanceData?.length ?? 'undefined',
  });

   useEffect(() => {
     if (studentId && mockExamPositionId) {
       console.log(`[Modal Effect] Prefetching performance for student ${studentId}`);
       prefetchStudentPerformance(studentId, mockExamPositionId);
     }
   }, [studentId]);

  if (!student) {
    console.log('[Modal Render] No student selected, returning null.');
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] max-h-[90vh] flex flex-col">
        <DialogHeader className="mb-4 shrink-0">
          <DialogTitle className="text-2xl flex items-center gap-2">
             <User className="h-6 w-6" /> Perfil do Aluno
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas, desempenho e progresso do aluno.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 border-b pb-6">
               {/* Info Basicas */}
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-sm font-medium text-muted-foreground">Nome:</span>
                    <span className="text-sm">{student.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-sm font-medium text-muted-foreground">Membro desde:</span>
                    <span className="text-sm">{formatDate(student.created_at)}</span>
                </div>
                 <div className="flex items-center gap-2">
                     <Target className="h-4 w-4 text-muted-foreground"/>
                     <span className="text-sm font-medium text-muted-foreground">Cargo Alvo (Ex):</span>
                     <Badge variant="outline">Cargo {mockExamPositionId.substring(0, 5)}...</Badge>
                 </div>
            </div>

            <div className="space-y-6">
                {/* --- Desempenho por Tópico --- */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <BarChartHorizontal className="h-5 w-5 text-blue-600"/> Desempenho por Tópico (Cargo: {mockExamPositionId.substring(0,5)}...)
                    </h3>
                     {/* Log antes da renderização condicional */}
                     {/* {console.log('[Modal Render Logic] Checking conditions:', { isLoadingPerformance, errorPerformance })} */} {/* Removido do JSX */}

                     {isLoadingPerformance && (
                       <div className="flex items-center justify-center py-10 text-muted-foreground">
                         <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando desempenho...
                       </div>
                     )}
                     {errorPerformance && !isLoadingPerformance && (
                         <div className="flex flex-col items-center justify-center py-10 text-red-600 bg-red-50 border border-red-200 rounded-md p-4">
                             <ServerCrash className="h-8 w-8 mb-2"/>
                             <p className="font-medium">Erro ao carregar desempenho:</p>
                             <p className="text-sm text-center">{errorPerformance.message}</p>
                         </div>
                     )}
                     {!isLoadingPerformance && !errorPerformance && (
                       // Removido o console.log daqui
                       <PerformanceTopicTable data={performanceData ?? []} />
                     )}
                </div>

                 {/* Placeholder Comparativo com a Média */}
                 <div className="p-4 border rounded-lg bg-gray-50">
                     <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-green-600"/> Comparativo com a Média</h3>
                     <p className="text-sm text-muted-foreground">Placeholder: Comparação com média da turma, perfil ideal, pontos fortes/fracos relativos.</p>
                      <div className="h-24 flex items-center justify-center text-gray-400 italic">Visualizações comparativas aqui...</div>
                 </div>

                  {/* Placeholder Alertas e Riscos */}
                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-600"/> Alertas e Pontos de Atenção</h3>
                      <p className="text-sm text-muted-foreground">Placeholder: Identificação de dificuldades persistentes, baixo engajamento, etc.</p>
                       <div className="h-16 flex items-center justify-center text-gray-400 italic">Alertas e ações rápidas aqui...</div>
                  </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};