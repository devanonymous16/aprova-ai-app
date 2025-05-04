// src/hooks/manager/useOrganizationMetrics.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface OrganizationMetrics {
  averageAccuracy: number | null;
  engagementRate: number | null;
  riskyStudentsCount: number | null;
  criticalTopicsCount: number | null;
  approvalRate?: number | null; // <<-- Adicionado KPI de Aprovação (opcional)
}

const fetchOrganizationMetrics = async (organizationId: string | null | undefined): Promise<OrganizationMetrics> => {
    console.log('[useOrganizationMetrics] Fetching metrics for org:', organizationId);
    if (!organizationId) {
        console.warn('[useOrganizationMetrics] Organization ID not available.');
        return { averageAccuracy: null, engagementRate: null, riskyStudentsCount: null, criticalTopicsCount: null, approvalRate: null };
    }

    // --- TODO: Implementar busca real no backend ---

    await new Promise(resolve => setTimeout(resolve, 500));

    const mockData: OrganizationMetrics = {
        averageAccuracy: Math.floor(Math.random() * 30) + 60,
        engagementRate: Math.floor(Math.random() * 40) + 55,
        riskyStudentsCount: Math.floor(Math.random() * 25),
        criticalTopicsCount: Math.floor(Math.random() * 10) + 3,
        approvalRate: Math.floor(Math.random() * 25) + 50, // <<-- Mock para aprovação 50-74%
    };
    console.log('[useOrganizationMetrics] Returning MOCK metrics:', mockData);
    return mockData;
};

export const useOrganizationMetrics = () => {
    // --- Usa user.id para a chave da query (mais seguro) ---
    const { user } = useAuth(); // Pega o usuário da sessão

    // --- TODO: Obter o organizationId real ---
    // A lógica para obter o organizationId REAL do manager ainda precisa ser implementada
    // (seja buscando em profiles.organization_id ou organization_users)
    // Por enquanto, derivamos um ID mock da forma mais segura (usando user.id se existir)
    const mockOrganizationId = user ? `org-for-user-${user.id.substring(0,5)}` : 'mock-org-id-no-user';
    // const organizationId = profile?.organization_id; // Forma ideal

    return useQuery<OrganizationMetrics, Error>({
        queryKey: ['organizationMetrics', mockOrganizationId], // Chave inclui ID mock
        queryFn: () => fetchOrganizationMetrics(mockOrganizationId), // Passa ID mock
        enabled: !!mockOrganizationId && mockOrganizationId !== 'mock-org-id-no-user', // Habilitado se tivermos um ID derivado
        staleTime: 5 * 60 * 1000,
    });
};