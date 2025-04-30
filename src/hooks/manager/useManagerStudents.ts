import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// Certifique-se que este path está correto para o seu tipo Profile
import { Profile } from '@/types/user';

// Tipo para os dados do aluno (mantido)
export interface ManagerStudentListItem {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

// --- FUNÇÃO MODIFICADA ---
const fetchManagerStudents = async (managerUserId: string): Promise<ManagerStudentListItem[]> => {
  if (!managerUserId) {
    throw new Error('Manager user ID is required');
  }

  console.log('[useManagerStudents MODIFIED] Fetching organization for manager:', managerUserId);

  // 1. Encontrar a organization_id do gerente (sem alterações aqui)
  const { data: orgUserData, error: orgUserError } = await supabase
    .from('organization_users')
    .select('organization_id')
    .eq('user_id', managerUserId)
    .maybeSingle();

  if (orgUserError) {
    console.error('[useManagerStudents MODIFIED] Error fetching organization user:', orgUserError);
    throw new Error(`Failed to fetch manager organization: ${orgUserError.message}`);
  }

  if (!orgUserData?.organization_id) {
    console.warn('[useManagerStudents MODIFIED] Manager not associated with any organization.');
    return [];
  }

  const organizationId = orgUserData.organization_id;
  console.log('[useManagerStudents MODIFIED] Manager belongs to organization:', organizationId);
  console.log('[useManagerStudents MODIFIED] Fetching student profiles for organization:', organizationId);

  // 2. Buscar diretamente da tabela 'profiles', filtrando por 'role' e pela associação à organização
  const { data: studentsData, error: studentsError } = await supabase
    .from('profiles') // <<-- COMEÇAMOS AQUI AGORA
    .select(`
      id,
      name,
      email,
      role,
      created_at,
      organization_users!inner ( organization_id ) 
    `) // <<-- Selecionamos dados do perfil E forçamos o JOIN com organization_users
    .eq('role', 'student') // <<-- Filtramos perfis de estudantes
    .eq('organization_users.organization_id', organizationId); // <<-- Filtramos pela ORG_ID através da tabela juntada

  if (studentsError) {
    console.error('[useManagerStudents MODIFIED] Error fetching students:', studentsError);
    const errorDetails = studentsError.details ? ` (${studentsError.details})` : '';
    // Tenta dar uma dica mais específica se for erro de relação
    if (studentsError.code === 'PGRST200') {
         throw new Error(`Failed to fetch students. PostgREST error: ${studentsError.message}. Verifique as relações e permissões (RLS) entre 'profiles' e 'organization_users'.${errorDetails}`);
    }
    throw new Error(`Failed to fetch students for organization: ${studentsError.message}${errorDetails}`);
  }

  console.log('[useManagerStudents MODIFIED] Raw students data fetched:', studentsData);

  // 3. Mapear os dados (A estrutura de 'studentsData' agora é diretamente a lista de perfis)
  // Não precisamos mais extrair de um objeto aninhado
  const students = studentsData
    ?.filter((profile): profile is Profile & { organization_users: any } => // Type guard
        profile !== null && typeof profile === 'object' && 'id' in profile && 'role' in profile
    )
    .map(profile => ({
      id: profile.id,
      name: profile.name ?? 'Nome não informado',
      email: profile.email ?? 'Email não informado',
      created_at: profile.created_at ?? new Date().toISOString(),
    })) ?? [];

  console.log('[useManagerStudents MODIFIED] Processed students list:', students);
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
      // Chama a função fetchManagerStudents MODIFICADA
      return fetchManagerStudents(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};