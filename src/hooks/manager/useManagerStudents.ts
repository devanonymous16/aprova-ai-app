import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// import { Profile } from '@/types/user'; // Linha removida ou comentada

// Tipo para os dados do aluno que queremos na lista (mantido)
export interface ManagerStudentListItem {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

// --- FUNÇÃO fetchManagerStudents (VERSÃO ANTERIOR, SEM RPC, MAS CORRIGIDA) ---
// Mantendo esta versão por enquanto, pois a RPC pode ter outras questões.
const fetchManagerStudents = async (managerUserId: string): Promise<ManagerStudentListItem[]> => {
  if (!managerUserId) {
    throw new Error('Manager user ID is required');
  }

  console.log('[useManagerStudents CORRECTED] Fetching organization for manager:', managerUserId);

  // 1. Encontrar a organization_id do gerente
  const { data: orgUserData, error: orgUserError } = await supabase
    .from('organization_users')
    .select('organization_id')
    .eq('user_id', managerUserId)
    .maybeSingle();

  if (orgUserError) {
    console.error('[useManagerStudents CORRECTED] Error fetching organization user:', orgUserError);
    throw new Error(`Failed to fetch manager organization: ${orgUserError.message}`);
  }

  if (!orgUserData?.organization_id) {
    console.warn('[useManagerStudents CORRECTED] Manager not associated with any organization.');
    return [];
  }

  const organizationId = orgUserData.organization_id;
  console.log('[useManagerStudents CORRECTED] Manager belongs to organization:', organizationId);
  console.log('[useManagerStudents CORRECTED] Fetching student profiles for organization:', organizationId);

  // 2. Buscar diretamente da tabela 'profiles', filtrando e juntando organization_users
  const { data: studentsData, error: studentsError } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      email,
      role,
      created_at,
      organization_users!inner ( organization_id ) 
    `)
    .eq('role', 'student')
    .eq('organization_users.organization_id', organizationId);

  if (studentsError) {
    console.error('[useManagerStudents CORRECTED] Error fetching students:', studentsError);
    const errorDetails = studentsError.details ? ` (${studentsError.details})` : '';
    if (studentsError.code === 'PGRST200') {
         throw new Error(`Failed to fetch students. PostgREST error: ${studentsError.message}. Verifique as relações e permissões (RLS) entre 'profiles' e 'organization_users'.${errorDetails}`);
    }
    throw new Error(`Failed to fetch students for organization: ${studentsError.message}${errorDetails}`);
  }

  console.log('[useManagerStudents CORRECTED] Raw students data fetched:', studentsData);

  // 3. Mapear os dados - CORREÇÃO NO TYPE GUARD ABAIXO
  const students = studentsData
     // Checa se 'profile' é um objeto válido com as propriedades esperadas, SEM USAR o nome 'Profile'
    ?.filter((profile): profile is { id: string; name: string | null; email: string | null; role: string | null; created_at: string | null; organization_users: any } =>
        profile !== null &&
        typeof profile === 'object' &&
        'id' in profile && typeof profile.id === 'string' && // Verifica 'id'
        'role' in profile // Verifica se 'role' existe (já filtramos por 'student', mas bom ter)
        // Não precisamos checar 'name', 'email', 'created_at' aqui pois eles podem ser null
    )
    .map(profile => ({
      id: profile.id,
      name: profile.name ?? 'Nome não informado',
      email: profile.email ?? 'Email não informado',
      created_at: profile.created_at ?? new Date().toISOString(),
    })) ?? [];

  console.log('[useManagerStudents CORRECTED] Processed students list:', students);
  return students;
};
// --- FIM DA FUNÇÃO MODIFICADA ---


// Hook customizado (sem alterações aqui)
export const useManagerStudents = () => {
  const { user } = useAuth();

  return useQuery<ManagerStudentListItem[], Error>({
    queryKey: ['managerStudents', user?.id],
    queryFn: () => {
      if (!user?.id) {
         return Promise.reject(new Error('User not authenticated'));
      }
      // Chama a função fetchManagerStudents CORRIGIDA (sem RPC por enquanto)
      return fetchManagerStudents(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};