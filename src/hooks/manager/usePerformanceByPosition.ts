// src/hooks/manager/usePerformanceByPosition.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext'; // Para obter orgId (futuro)

// Tipagem para os dados de um tópico agregado por cargo
export interface PositionTopicPerformance {
  topicId: string;
  topicName: string;
  subjectName: string;
  groupAccuracyPercentage: number | null;
  strugglingStudentPercent: number | null; // % de alunos abaixo de X% de acerto
  questionsAnsweredCount: number;
}

// Tipagem para os dados agregados de um cargo/concurso
export interface PositionPerformanceData {
  positionId: string;
  positionName: string;
  examName: string;
  studentCount: number;
  overallAccuracy: number | null;
  criticalTopicsCount: number; // Quantos tópicos estão abaixo de um limiar
  topics: PositionTopicPerformance[]; // Desempenho detalhado por tópico para este cargo
}

// Função de busca (atualmente mockada)
const fetchPerformanceByPosition = async (organizationId: string | null | undefined): Promise<PositionPerformanceData[]> => {
    console.log('[usePerformanceByPosition] Fetching performance by position for org:', organizationId);
    if (!organizationId) {
        console.warn('[usePerformanceByPosition] Organization ID not available.');
        return [];
    }

    // --- TODO: Implementar busca real no backend ---
    // 1. Encontrar os `exam_position_id` ativos associados à `organizationId`.
    // 2. Para cada `positionId`:
    //    a. Contar alunos associados (`organization_users` + `student_exams`?).
    //    b. Calcular a média geral de acertos para esses alunos nesse cargo (agregando `student_topic_performance`?).
    //    c. Buscar os tópicos do edital desse cargo (`exam_position_topics`?).
    //    d. Para cada tópico, calcular a média de acerto do grupo e a % de alunos com dificuldade.
    //    e. Contar tópicos críticos.

    // Simula delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // --- Mock Data ---
    const mockPositions: PositionPerformanceData[] = [
        {
            positionId: 'pos-prf-01',
            positionName: 'Policial Rodoviário Federal',
            examName: 'Concurso PRF 2025',
            studentCount: 152,
            overallAccuracy: 71,
            criticalTopicsCount: 5,
            topics: [
                { topicId: 'prf-t1', topicName: 'Direitos Humanos', subjectName: 'Direitos Humanos e Cidadania', groupAccuracyPercentage: 65, strugglingStudentPercent: 35, questionsAnsweredCount: 1250 },
                { topicId: 'prf-t2', topicName: 'Legislação de Trânsito', subjectName: 'Legislação Especial', groupAccuracyPercentage: 75, strugglingStudentPercent: 20, questionsAnsweredCount: 3500 },
                { topicId: 'prf-t3', topicName: 'Raciocínio Lógico-Quantitativo', subjectName: 'Raciocínio Lógico', groupAccuracyPercentage: 58, strugglingStudentPercent: 45, questionsAnsweredCount: 980 },
                { topicId: 'prf-t4', topicName: 'Direito Administrativo', subjectName: 'Direito Administrativo', groupAccuracyPercentage: 78, strugglingStudentPercent: 15, questionsAnsweredCount: 2100 },
                { topicId: 'prf-t5', topicName: 'Física Aplicada', subjectName: 'Física', groupAccuracyPercentage: 45, strugglingStudentPercent: 60, questionsAnsweredCount: 550 },
                // ... adicionar mais tópicos mockados
            ]
        },
        {
            positionId: 'pos-gcm-jag-01',
            positionName: 'Guarda Civil Municipal',
            examName: 'Concurso GCM Jaguaribe 2025',
            studentCount: 85,
            overallAccuracy: 67,
            criticalTopicsCount: 3,
            topics: [
                { topicId: 'gcm-t1', topicName: 'Português Instrumental', subjectName: 'Língua Portuguesa', groupAccuracyPercentage: 70, strugglingStudentPercent: 25, questionsAnsweredCount: 1500 },
                { topicId: 'gcm-t2', topicName: 'Direito Constitucional (Art. 5)', subjectName: 'Direito Constitucional', groupAccuracyPercentage: 62, strugglingStudentPercent: 40, questionsAnsweredCount: 800 },
                { topicId: 'gcm-t3', topicName: 'Noções de Primeiros Socorros', subjectName: 'Conhecimentos Específicos', groupAccuracyPercentage: 75, strugglingStudentPercent: 18, questionsAnsweredCount: 450 },
                { topicId: 'gcm-t4', topicName: 'Estatuto Geral das Guardas', subjectName: 'Legislação Específica', groupAccuracyPercentage: 60, strugglingStudentPercent: 38, questionsAnsweredCount: 600 },
                // ...
            ]
        },
         {
            positionId: 'pos-tj-ana-01',
            positionName: 'Analista Judiciário - Área Judiciária',
            examName: 'Concurso TJ Ceará 2024',
            studentCount: 115,
            overallAccuracy: 75,
            criticalTopicsCount: 2,
            topics: [
                { topicId: 'tj-t1', topicName: 'Direito Civil (Contratos)', subjectName: 'Direito Civil', groupAccuracyPercentage: 72, strugglingStudentPercent: 22, questionsAnsweredCount: 1800 },
                { topicId: 'tj-t2', topicName: 'Direito Processual Civil (Recursos)', subjectName: 'Direito Processual Civil', groupAccuracyPercentage: 68, strugglingStudentPercent: 30, questionsAnsweredCount: 1650 },
                { topicId: 'tj-t3', topicName: 'Língua Portuguesa (Redação Oficial)', subjectName: 'Língua Portuguesa', groupAccuracyPercentage: 80, strugglingStudentPercent: 10, questionsAnsweredCount: 950 },
                // ...
            ]
        },
    ];

    console.log('[usePerformanceByPosition] Returning MOCK data:', mockPositions);
    return mockPositions;
};

// Hook React Query
export const usePerformanceByPosition = () => {
    const { user } = useAuth(); // Para obter orgId no futuro
    // TODO: Obter organizationId real
    const mockOrganizationId = user ? `org-for-user-${user.id.substring(0,5)}` : 'mock-org-id-no-user';

    return useQuery<PositionPerformanceData[], Error>({
        queryKey: ['performanceByPosition', mockOrganizationId],
        queryFn: () => fetchPerformanceByPosition(mockOrganizationId),
        enabled: !!mockOrganizationId && mockOrganizationId !== 'mock-org-id-no-user',
        staleTime: 10 * 60 * 1000, // 10 minutos (dados agregados mudam menos)
    });
};