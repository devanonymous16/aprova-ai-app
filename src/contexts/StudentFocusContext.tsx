// src/contexts/StudentFocusContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { useAuth } from './AuthContext'; 
import { toast } from '@/components/ui/sonner'; 

export interface LinkedPosition {
  student_exam_id: string;
  exam_position_id: string;
  position_name: string;
  is_current_focus: boolean;
  overall_exam_status: string | null; // Pode ser null se não definido no DB
  access_type: string | null;         // Pode ser null
  // Novos campos da RPC:
  organ_id: string | null;
  organ_name: string | null;
  banca_id: string | null;
  banca_name: string | null;
  education_level_id: string | null;
  education_level_name: string | null;
  related_exam_id: string | null;

}

interface StudentFocusContextType {
  linkedPositions: LinkedPosition[] | null;
  currentActiveExamPositionId: string | null;
  currentStudentExamId: string | null; 
  isLoadingFocus: boolean;
  fetchLinkedPositions: () => Promise<void>; // <<< GARANTIR QUE ESTÁ AQUI
  setCurrentFocus: (studentExamId: string, examPositionId: string) => Promise<void>;
}

const StudentFocusContext = createContext<StudentFocusContextType | undefined>(undefined);

export const StudentFocusProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); 

  const [linkedPositions, setLinkedPositions] = useState<LinkedPosition[] | null>(null);
  const [currentActiveExamPositionId, setCurrentActiveExamPositionId] = useState<string | null>(null);
  const [currentStudentExamId, setCurrentStudentExamId] = useState<string | null>(null);
  const [isLoadingFocus, setIsLoadingFocus] = useState(true);


  const _updateLocalStatesAfterFocusChange = useCallback((
    studentExamId: string, 
    examPositionId: string,
    allPositions: LinkedPosition[]
  ) => {
    setCurrentActiveExamPositionId(examPositionId);
    setCurrentStudentExamId(studentExamId);
    const updatedPositions = allPositions.map(p => ({
      ...p,
      is_current_focus: p.student_exam_id === studentExamId
    }));
    setLinkedPositions(updatedPositions);
    console.log('[StudentFocusContext] Estados locais e linkedPositions atualizados após definir foco.');
  }, []);


  // Declarar fetchLinkedPositions antes de setCurrentFocus para que possa ser referenciada
  const fetchLinkedPositions = useCallback(async () => {
    if (!user?.id) {
      setLinkedPositions(null); 
      setCurrentActiveExamPositionId(null);
      setCurrentStudentExamId(null);
      setIsLoadingFocus(false);
      return;
    }

    console.log('[StudentFocusContext] fetchLinkedPositions: Buscando cargos para:', user.id);
    setIsLoadingFocus(true);
    try {
      const { data, error } = await supabase.rpc('get_student_linked_positions', { 
        p_student_id: user.id 
      });

      if (error) throw error;

      const positions = data || [];
      console.log('[StudentFocusContext] fetchLinkedPositions: Cargos recebidos:', positions);
      setLinkedPositions(positions); // Define as posições primeiro

      const focusedPosition = positions.find(p => p.is_current_focus === true);
      
      if (focusedPosition) {
        console.log('[StudentFocusContext] fetchLinkedPositions: Foco encontrado no DB:', focusedPosition);
        // _updateLocalStatesAfterFocusChange(focusedPosition.student_exam_id, focusedPosition.exam_position_id, positions);
        // Apenas define os IDs, a flag is_current_focus já está correta vinda do DB
        setCurrentActiveExamPositionId(focusedPosition.exam_position_id);
        setCurrentStudentExamId(focusedPosition.student_exam_id);
      } else if (positions.length > 0) {
        console.log('[StudentFocusContext] fetchLinkedPositions: Nenhum foco no DB, definindo o primeiro:', positions[0]);
        // Chama a RPC para definir o foco e depois atualiza os estados locais
        // É importante que setCurrentFocus (ou _setCurrentFocusLogic) atualize linkedPositions também
        // para refletir o is_current_focus = true para o item correto.
        // A chamada abaixo irá chamar a RPC e depois atualizar localmente.
        // A função setCurrentFocus é definida abaixo.
        // Para evitar chamar uma função que ainda não está totalmente definida no escopo do useCallback,
        // vamos refatorar ligeiramente.
        // Por agora, apenas definimos o estado, a RPC de set_student_focus_position será chamada por setCurrentFocus
        setCurrentActiveExamPositionId(positions[0].exam_position_id);
        setCurrentStudentExamId(positions[0].student_exam_id);
        // A RPC set_student_focus_position será chamada quando o usuário interagir ou se quisermos forçar
        // no primeiro carregamento, podemos chamar setCurrentFocus aqui após setLinkedPositions.
      } else {
        console.log('[StudentFocusContext] fetchLinkedPositions: Nenhum cargo vinculado.');
        // setLinkedPositions([]); // Já está sendo feito por setLinkedPositions(positions)
        setCurrentActiveExamPositionId(null);
        setCurrentStudentExamId(null);
      }
    } catch (err: any) {
      console.error("Erro em fetchLinkedPositions (catch):", err.message);
      toast.error("Erro ao carregar seus concursos", { description: err.message });
      setLinkedPositions(null); 
      setCurrentActiveExamPositionId(null);
      setCurrentStudentExamId(null);
    } finally {
      setIsLoadingFocus(false);
    }
  }, [user]); // Removido _updateLocalStatesAfterFocusChange e setCurrentFocus daqui para quebrar dependências circulares


  const setCurrentFocus = useCallback(async (studentExamId: string, examPositionId: string) => {
    if (!user?.id || !linkedPositions) { 
        console.warn("[StudentFocusContext] setCurrentFocus chamado sem usuário ou linkedPositions carregadas");
        return;
    }
    
    if (currentStudentExamId === studentExamId && currentActiveExamPositionId === examPositionId) {
        const currentFocusedItem = linkedPositions.find(p => p.student_exam_id === studentExamId);
        if (currentFocusedItem && currentFocusedItem.is_current_focus) {
            console.log("[StudentFocusContext] Foco já é este, não fazendo nada:", studentExamId);
            return;
        }
    }

    console.log(`[StudentFocusContext] Usuário requisitou definir foco: student_exam_id=${studentExamId}, exam_position_id=${examPositionId}`);
    setIsLoadingFocus(true);
    try {
      const { error: rpcError } = await supabase.rpc('set_student_focus_position', {
        p_student_id: user.id,
        p_student_exam_id_to_focus: studentExamId
      });

      if (rpcError) {
        console.error("Erro RPC ao definir set_student_focus_position:", rpcError);
        throw rpcError;
      }
      
      // Atualiza estados locais
      _updateLocalStatesAfterFocusChange(studentExamId, examPositionId, linkedPositions);
      
      const focusedPositionName = linkedPositions.find(p => p.student_exam_id === studentExamId)?.position_name || examPositionId;
      toast.success(`Foco de estudo alterado para: ${focusedPositionName}`);

    } catch (err: any) {
      console.error("Erro em setCurrentFocus:", err.message);
      toast.error("Erro ao alterar foco do concurso", { description: err.message });
    } finally {
      setIsLoadingFocus(false);
    }
  }, [user, linkedPositions, currentStudentExamId, currentActiveExamPositionId, _updateLocalStatesAfterFocusChange]);


  // Efeito para buscar os cargos vinculados quando o usuário loga ou o contexto é montado
  useEffect(() => {
    if (user?.id) {
      fetchLinkedPositions();
    } else {
      setLinkedPositions(null);
      setCurrentActiveExamPositionId(null);
      setCurrentStudentExamId(null);
      setIsLoadingFocus(false); 
    }
  }, [user, fetchLinkedPositions]);


  return (
    <StudentFocusContext.Provider value={{
      linkedPositions,
      currentActiveExamPositionId,
      currentStudentExamId,
      isLoadingFocus,
      fetchLinkedPositions, // <<< EXPOSTO AQUI
      setCurrentFocus
    }}>
      {children}
    </StudentFocusContext.Provider>
  );
};

export const useStudentFocus = () => {
  const context = useContext(StudentFocusContext);
  if (context === undefined) {
    throw new Error('useStudentFocus must be used within a StudentFocusProvider');
  }
  return context;
};