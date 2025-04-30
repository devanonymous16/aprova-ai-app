import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  // DialogClose, // Podemos usar o 'x' padrão ou um botão customizado
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Mail, CalendarDays, BarChartHorizontal, Users, Target, AlertTriangle } from 'lucide-react'; // Ícones
import { ManagerStudentListItem } from '@/hooks/manager/useManagerStudents'; // Importa o tipo base
import { Badge } from '@/components/ui/badge'; // Para status ou tags futuras

interface StudentDetailModalProps {
  student: ManagerStudentListItem | null; // Aluno selecionado ou null
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void; // Função para fechar/controlar estado
}

// Helper para formatar data (pode mover para utils se usar em mais lugares)
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
  if (!student) {
    return null; // Não renderiza nada se não houver aluno selecionado
  }

  // TODO - Fase Futura:
  // const { data: performanceData, isLoading: isLoadingPerformance, error: errorPerformance } = useStudentPerformance(student.id, isOpen);
  // const { data: comparisonData, isLoading: isLoadingComparison, error: errorComparison } = useStudentComparison(student.id, isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto"> {/* Largura e Altura Máxima */}
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
             <User className="h-6 w-6" /> Perfil do Aluno
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas, desempenho e progresso do aluno.
          </DialogDescription>
        </DialogHeader>

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 border-b pb-6">
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
             {/* Placeholder para Status ou Nível */}
             <div className="flex items-center gap-2">
                 <Target className="h-4 w-4 text-muted-foreground"/>
                 <span className="text-sm font-medium text-muted-foreground">Nível/Cargo Alvo:</span>
                 <Badge variant="secondary">A definir</Badge>
             </div>
        </div>

        {/* Placeholders para Seções Futuras */}
        <div className="space-y-6">
            {/* Placeholder Desempenho Geral */}
            <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BarChartHorizontal className="h-5 w-5 text-blue-600"/> Desempenho Geral</h3>
                 <p className="text-sm text-muted-foreground">Placeholder: Gráficos de progresso, pontuação média, tempo de estudo, etc.</p>
                 {/* Exemplo de como seria com loading/error */}
                 {/* {isLoadingPerformance && <p>Carregando desempenho...</p>} */}
                 {/* {errorPerformance && <p className="text-red-600">Erro ao carregar desempenho.</p>} */}
                 {/* {performanceData && <PerformanceCharts data={performanceData} />} */}
                 <div className="h-24 flex items-center justify-center text-gray-400 italic">Gráficos aqui...</div>
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

        {/* <DialogFooter className="mt-6">
           {/* Poderia ter botões de Ação aqui (Editar, Enviar Mensagem, etc.) */}
          {/* <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Fechar</Button> */}
        {/* </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};