import React from 'react';
// Imports de shadcn/ui Dialog REMOVIDOS
import { User, Mail, CalendarDays, Target, X } from 'lucide-react'; // Ícone X para fechar
import { ManagerStudentListItem } from '@/hooks/manager/useManagerStudents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Para o botão de fechar

interface StudentDetailModalProps {
  student: ManagerStudentListItem | null;
  isOpen: boolean; // Ainda usamos para controlar se renderizamos
  onOpenChange: (isOpen: boolean) => void; // Para o botão fechar
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

// --- VERSÃO COM DIV SIMULANDO MODAL ---
export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, isOpen, onOpenChange }) => {
    const studentId = student?.id ?? null;
    console.log(`[Modal NATIVO Render] isOpen: ${isOpen}, studentId: ${studentId}`);

    // Não renderiza nada se não estiver aberto ou sem aluno
    if (!isOpen || !student) {
      console.log('[Modal NATIVO Render] Not open or no student, returning null.');
      return null;
    }

  // Renderiza o modal simulado
  return (
    // Overlay (fundo escuro)
    <div
        // role="dialog" aria-modal="true" // Atributos de acessibilidade
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={() => onOpenChange(false)} // Fecha ao clicar fora (simples)
    >
      {/* Conteúdo do Modal */}
      <div
          className="relative z-50 w-full max-w-xl bg-white rounded-lg shadow-xl p-6 overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()} // Impede que clique dentro feche o modal
       >
            {/* Botão de Fechar */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-7 w-7 rounded-full"
                onClick={() => onOpenChange(false)}
                aria-label="Fechar modal"
            >
                <X className="h-5 w-5" />
            </Button>

            {/* Cabeçalho Simulado */}
            <div className="mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <User className="h-6 w-6" /> Perfil do Aluno (Teste Nativo)
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Informações básicas e teste de renderização.
                </p>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 border-b pb-6">
                <div className="flex items-center gap-2"> <User className="h-4 w-4 text-muted-foreground"/> Nome: <span className="text-sm">{student.name}</span></div>
                <div className="flex items-center gap-2"> <Mail className="h-4 w-4 text-muted-foreground"/> Email: <span className="text-sm">{student.email}</span></div>
                <div className="flex items-center gap-2"> <CalendarDays className="h-4 w-4 text-muted-foreground"/> Membro desde: <span className="text-sm">{formatDate(student.created_at)}</span></div>
                <div className="flex items-center gap-2"> <Target className="h-4 w-4 text-muted-foreground"/> Cargo Alvo (Ex): <Badge variant="outline">A definir</Badge></div>
            </div>

            {/* --- TESTE DE RENDERIZAÇÃO SIMPLES --- */}
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <h3 className="text-lg font-semibold mb-2">Teste de Conteúdo do Modal (Nativo)</h3>
                <p className="text-green-700 font-bold">Se você está vendo este texto, o modal nativo e seu conteúdo renderizaram!</p>
                <p>ID do Aluno: {student.id}</p>
            </div>

      </div>
    </div>
  );
};