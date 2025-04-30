// src/hooks/student/useStudentPerformanceData.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client'; // Manter para futura implementação real
// --- IMPORTAÇÃO CORRIGIDA ---
import { queryClient } from '@/lib/react-query'; // <<< Importa do novo local

// Tipo para os dados de desempenho por tópico que o hook retornará
export interface TopicPerformanceData {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  accuracyPercentage: number | null; // Pode ser null se não houver dados
  questionsAnswered: number;
  totalStudyTimeMinutes: number;
  // examPositionId: string; // TODO: Adicionar quando o schema for atualizado
}

// --- MOCK DATA ---
const generateMockPerformanceData = (studentId: string | null, examPositionId: string | null): TopicPerformanceData[] => {
  console.log(`[Mock] Generating performance data for student ${studentId} and position ${examPositionId}`);
  if (!studentId) return []; // Não gera dados sem studentId

  // Simula diferentes tópicos e desempenhos
  const subjects = [
    { id: 'subj-1', name: 'Língua Portuguesa' },
    { id: 'subj-2', name: 'Direito Administrativo' },
    { id: 'subj-3', name: 'Raciocínio Lógico' },
  ];
  const topics = [
    { id: 'topic-1a', name: 'Concordância Nominal', subjectId: 'subj-1' },
    { id: 'topic-1b', name: 'Uso da Crase', subjectId: 'subj-1' },
    { id: 'topic-1c', name: 'Interpretação de Texto', subjectId: 'subj-1' },
    { id: 'topic-2a', name: 'Atos Administrativos', subjectId: 'subj-2' },
    { id: 'topic-2b', name: 'Licitações (Lei 14.133)', subjectId: 'subj-2' },
    { id: 'topic-2c', name: 'Controle da Administração', subjectId: 'subj-2' },
    { id: 'topic-3a', name: 'Proposições Lógicas', subjectId: 'subj-3' },
    { id: 'topic-3b', name: 'Tabelas Verdade', subjectId: 'subj-3' },
    { id: 'topic-3c', name: 'Equivalências', subjectId: 'subj-3' },
  ];

  return topics.map(topic => {
    const subject = subjects.find(s => s.id === topic.subjectId);
    const questions = Math.floor(Math.random() * 50) + 5; // 5 a 54 questões
    const correct = Math.floor(Math.random() * questions);
    const accuracy = questions > 0 ? Math.round((correct / questions) * 100) : null;
    const time = Math.floor(Math.random() * 120) + 10; // 10 a 129 min

    return {
      topicId: topic.id,
      topicName: topic.name,
      subjectId: topic.subjectId,
      subjectName: subject?.name ?? 'Disciplina Desconhecida',
      accuracyPercentage: accuracy,
      questionsAnswered: questions,
      totalStudyTimeMinutes: time,
      // examPositionId: examPositionId ?? 'mock-pos-id', // Simula o ID do cargo
    };
  });
};

// Função de busca (atualmente retorna mock)
const fetchStudentPerformance = async (studentId: string | null, examPositionId: string | null): Promise<TopicPerformanceData[]> => {
    // TODO: Implementar busca real no Supabase
    console.log(`[useStudentPerformanceData] Fetching performance for student: ${studentId}, position: ${examPositionId}`);
    if (!studentId) {
        throw new Error('Student ID is required to fetch performance data.');
    }
    await new Promise(resolve => setTimeout(resolve, 750)); // Simula delay
    const mockData = generateMockPerformanceData(studentId, examPositionId);
    console.log("[useStudentPerformanceData] Returning MOCK data:", mockData)
    return mockData;
};

// Hook React Query
export const useStudentPerformanceData = (studentId: string | null, examPositionId: string | null) => {
  return useQuery<TopicPerformanceData[], Error>({
    queryKey: ['studentPerformance', studentId, examPositionId],
    queryFn: () => fetchStudentPerformance(studentId, examPositionId),
    enabled: !!studentId && !!examPositionId,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
};

// Função para pré-buscar os dados
export const prefetchStudentPerformance = (studentId: string | null, examPositionId: string | null) => {
    if (!studentId || !examPositionId) return;
    // Usa o queryClient importado do local correto
    queryClient.prefetchQuery({
        queryKey: ['studentPerformance', studentId, examPositionId],
        queryFn: () => fetchStudentPerformance(studentId, examPositionId),
        staleTime: 60 * 1000,
    });
};