// src/hooks/manager/useInterventionRecommendations.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Tipos para os dados retornados
interface CriticalTopic {
  id: string;
  subjectName: string;
  topicName: string;
  averageAccuracy: number | null;
  strugglingStudentCount: number; // Quantos alunos estão abaixo de X%
}

interface DifficultyGroup {
  id: string;
  difficultyArea: string; // Ex: "Disciplina - Tópico" ou só "Disciplina"
  studentCount: number;
  studentSample: { id: string, name: string | null }[]; // Amostra de alunos
}

export interface InterventionRecommendations {
  criticalTopics: CriticalTopic[];
  studentGroupsByDifficulty: DifficultyGroup[];
}

// Função de busca (atualmente mockada)
const fetchInterventionRecommendations = async (organizationId: string | null | undefined): Promise<InterventionRecommendations> => {
    console.log('[useInterventionRecs] Fetching recommendations for org:', organizationId);
    if (!organizationId) {
        console.warn('[useInterventionRecs] Organization ID not available.');
        return { criticalTopics: [], studentGroupsByDifficulty: [] };
    }

    // --- TODO: Implementar busca real no backend ---
    // 1. Analisar dados agregados de 'student_topic_performance' para a organização.
    // 2. Identificar tópicos com menor 'averageAccuracy' ou maior '% de struggling'.
    // 3. Agrupar alunos com baixo desempenho nos mesmos tópicos/disciplinas.

    await new Promise(resolve => setTimeout(resolve, 600)); // Simula delay

    // Mock Data
    const mockData: InterventionRecommendations = {
        criticalTopics: [
            { id: 'topic-phys', subjectName: 'Física', topicName: 'Física Aplicada', averageAccuracy: 45, strugglingStudentCount: 91 },
            { id: 'topic-rlm', subjectName: 'Raciocínio Lógico', topicName: 'Raciocínio Lógico-Quantitativo', averageAccuracy: 58, strugglingStudentCount: 68 },
            { id: 'topic-gcm-leg', subjectName: 'Legislação Específica', topicName: 'Estatuto Geral das Guardas', averageAccuracy: 60, strugglingStudentCount: 32 },
            { id: 'topic-const', subjectName: 'Direito Constitucional', topicName: 'Direito Constitucional (Art. 5)', averageAccuracy: 62, strugglingStudentCount: 34 },
            { id: 'topic-dh', subjectName: 'Direitos Humanos', topicName: 'Direitos Humanos e Cidadania', averageAccuracy: 65, strugglingStudentCount: 53 },
        ].sort((a, b) => (a.averageAccuracy ?? 101) - (b.averageAccuracy ?? 101)), // Ordena pelos piores primeiro
        studentGroupsByDifficulty: [
            { id: 'group-fis', difficultyArea: 'Física', studentCount: 91, studentSample: [{id:'s1', name:'Aluno F1'}, {id:'s2', name:'Aluno F2'}, {id:'s3', name:'Aluno F3'}] },
            { id: 'group-rlm', difficultyArea: 'Raciocínio Lógico', studentCount: 68, studentSample: [{id:'s4', name:'Aluno R1'}, {id:'s5', name:'Aluno R2'}, {id:'s6', name:'Aluno R3'}] },
            { id: 'group-dh', difficultyArea: 'Direitos Humanos', studentCount: 53, studentSample: [{id:'s7', name:'Aluno D1'}, {id:'s8', name:'Aluno D2'}] },
            { id: 'group-gcm', difficultyArea: 'Legislação Específica GCM', studentCount: 32, studentSample: [{id:'s9', name:'Aluno G1'}, {id:'s10', name:'Aluno G2'}] },
        ].sort((a, b) => b.studentCount - a.studentCount), // Ordena pelos maiores grupos
    };

    console.log('[useInterventionRecs] Returning MOCK data:', mockData);
    return mockData;
};

// Hook React Query
export const useInterventionRecommendations = () => {
    const { user } = useAuth();
    const mockOrganizationId = user ? `org-for-user-${user.id.substring(0,5)}` : 'mock-org-id-no-user';

    return useQuery<InterventionRecommendations, Error>({
        queryKey: ['interventionRecommendations', mockOrganizationId],
        queryFn: () => fetchInterventionRecommendations(mockOrganizationId),
        enabled: !!mockOrganizationId && mockOrganizationId !== 'mock-org-id-no-user',
        staleTime: 15 * 60 * 1000, // 15 minutos (análise menos frequente)
    });
};