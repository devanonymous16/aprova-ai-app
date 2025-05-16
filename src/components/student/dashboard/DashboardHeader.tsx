// src/components/student/dashboard/DashboardHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Calendar, Activity } from 'lucide-react'; // Adicionado Activity como exemplo
import { LinkedPosition } from '@/contexts/StudentFocusContext'; // Importe o tipo

// Defina as props que o componente aceita
export interface DashboardHeaderProps {
  userName: string;
  showFocusSelector?: boolean;
  linkedPositions?: LinkedPosition[] | null;
  currentStudentExamId?: string | null;
  isLoadingFocus?: boolean;
  onFocusChange?: (studentExamId: string) => void;
  onContinueStudying?: () => void;
  isContinueStudyingDisabled?: boolean;
}

export default function DashboardHeader({
  userName,
  showFocusSelector,
  linkedPositions,
  currentStudentExamId,
  isLoadingFocus,
  onFocusChange,
  onContinueStudying,
  isContinueStudyingDisabled
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      {/* Seção de Boas-vindas e Seletor de Foco (se houver) */}
      <div className="flex-1"> {/* Ocupa o espaço disponível */}
        <h1 className="text-3xl font-bold font-heading">Olá, {userName}!</h1>
        <p className="text-muted-foreground">
          Bem-vindo(a) ao seu painel de estudos personalizado.
        </p>
        {showFocusSelector && linkedPositions && linkedPositions.length > 0 && (
          <div className="mt-4 md:mt-2"> {/* Espaçamento para o Select */}
            <Select
              value={currentStudentExamId || ''}
              onValueChange={(value) => {
                if (value && onFocusChange) {
                  onFocusChange(value);
                }
              }}
              disabled={isLoadingFocus}
            >
              <SelectTrigger className="w-full sm:w-[280px] md:w-[350px]"> {/* Ajuste a largura conforme necessário */}
                <SelectValue placeholder={isLoadingFocus ? "Carregando focos..." : "Mudar Foco do Estudo"} />
              </SelectTrigger>
              <SelectContent>
                {linkedPositions.map((pos) => (
                  <SelectItem key={pos.student_exam_id} value={pos.student_exam_id}>
                    {pos.position_name}
                    {pos.is_current_focus && " (Foco Atual)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
         {showFocusSelector && isLoadingFocus && <p className="text-sm text-muted-foreground mt-2">Carregando seus concursos...</p>}
      </div>
      
      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
        {/* <Link to="/student/study-plan"> // Link para Plano de Estudos, se existir
          <Button variant="outline" className="w-full sm:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            Ver plano de estudos
          </Button>
        </Link> */}
        {onContinueStudying && ( // Renderiza o botão apenas se a função for passada
          <Button 
            onClick={onContinueStudying} 
            disabled={isContinueStudyingDisabled}
            className="w-full sm:w-auto"
            size="lg" // Botão maior para destaque
          >
            <Activity className="h-4 w-4 mr-2" /> {/* Ícone diferente para "Continuar estudando" */}
            Continuar estudando
          </Button>
        )}
      </div>
    </div>
  );
}