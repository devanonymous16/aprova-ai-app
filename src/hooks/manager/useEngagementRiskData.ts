// src/hooks/manager/useEngagementRiskData.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// --- Tipos ---
interface EngagementKPIs {
  weeklyActivePercent: number | null;
  averageSessionMinutes: number | null;
}

// Tipo Literal para warningReason
type WarningReason = 'Inativo' | 'Baixo Uso' | 'Desempenho em Queda' | 'Outro';

interface RiskyStudent {
  studentId: string;
  studentName: string | null;
  lastLoginDaysAgo: number | null;
  timeSpentLastWeek: number | null;
  warningReason: WarningReason; // <<< USA O TIPO LITERAL AQUI
}

export interface EngagementRiskData {
  engagementKPIs: EngagementKPIs;
  riskyStudents: RiskyStudent[];
}

// --- Função Fetch ---
const fetchEngagementRiskData = async (organizationId: string | null | undefined): Promise<EngagementRiskData> => {
    console.log('[useEngagementRiskData] Fetching engagement/risk data for org:', organizationId);
    if (!organizationId) {
        console.warn('[useEngagementRiskData] Organization ID not available.');
        return { engagementKPIs: { weeklyActivePercent: null, averageSessionMinutes: null }, riskyStudents: [] };
    }
    await new Promise(resolve => setTimeout(resolve, 450));

    // --- Mock Data CORRIGIDO (Usando Tipagem Explícita) ---
    const mockRiskyStudents: RiskyStudent[] = [ // <<-- Tipagem explícita aqui ajuda a pegar erros
        { studentId: 's7', studentName: 'Aluno D1', lastLoginDaysAgo: 8, timeSpentLastWeek: 15, warningReason: 'Inativo' },
        { studentId: 's10', studentName: 'Aluno G2', lastLoginDaysAgo: 2, timeSpentLastWeek: 5, warningReason: 'Baixo Uso' },
        { studentId: 's3', studentName: 'Aluno F3', lastLoginDaysAgo: 10, timeSpentLastWeek: 45, warningReason: 'Inativo' },
        { studentId: 's5', studentName: 'Aluno R2', lastLoginDaysAgo: 3, timeSpentLastWeek: 140, warningReason: 'Desempenho em Queda' }, // OK
        { studentId: 's9', studentName: 'Aluno G1', lastLoginDaysAgo: 5, timeSpentLastWeek: 25, warningReason: 'Baixo Uso' },
    ];

    const mockData: EngagementRiskData = {
        engagementKPIs: {
            weeklyActivePercent: Math.floor(Math.random() * 30) + 65,
            averageSessionMinutes: Math.floor(Math.random() * 25) + 30,
        },
        riskyStudents: mockRiskyStudents.sort((a, b) => (a.lastLoginDaysAgo ?? 999) - (b.lastLoginDaysAgo ?? 999)), // Usa a variável tipada
    };
    // --- Fim do Mock Data Corrigido ---

    console.log('[useEngagementRiskData] Returning MOCK data:', mockData);
    return mockData;
};

// --- Hook React Query ---
export const useEngagementRiskData = () => {
    const { user } = useAuth();
    const mockOrganizationId = user ? `org-for-user-${user.id.substring(0,5)}` : 'mock-org-id-no-user';

    return useQuery<EngagementRiskData, Error>({
        queryKey: ['engagementRiskData', mockOrganizationId],
        queryFn: () => fetchEngagementRiskData(mockOrganizationId),
        enabled: !!mockOrganizationId && mockOrganizationId !== 'mock-org-id-no-user',
        staleTime: 10 * 60 * 1000,
    });
};