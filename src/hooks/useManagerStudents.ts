import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/user'; // Supondo que você tenha um tipo Profile

// Tipo para os dados do aluno que queremos na tabela (pode expandir depois)
export interface ManagerStudentListItem {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  // Adicionar status ou outras colunas básicas conforme necessário
}

// Função para buscar os alunos
const fetchManagerStudents = async (managerUserId: string): Promise<ManagerStudentListItem[]> => {
  if (!managerUserId) {
    throw new Error('Manager user ID is required');
  }

  console.log('[useManagerStudents] Fetching organization for manager:', managerUserId);

  // 1. Encontrar a organization_id do gerente
  const { data: orgUserData, error: orgUserError } = await supabase
    .from('organization_users')
    .select('organization_id')
    .eq('user_id', managerUserId)
    // .eq('role', 'manager') // Assumindo que o role 'manager' pode estar aqui ou no profile principal
    .maybeSingle(); // Usar maybeSingle se um manager só pertence a uma org

  if (orgUserError) {
    console.error('[useManagerStudents] Error fetching organization user:', orgUserError);
    throw new Error(`Failed to fetch manager organization: ${orgUserError.message}`);
  }

  if (!orgUserData?.organization_id) {
    console.warn('[useManagerStudents] Manager not associated with any organization.');
    return []; // Retorna vazio se o manager não pertence a nenhuma organização
  }

  const organizationId = orgUserData.organization_id;
  console.log('[useManagerStudents] Manager belongs to organization:', organizationId);
  console.log('[useManagerStudents] Fetching students for organization:', organizationId);

  // 2. Buscar perfis de estudantes associados a essa organization_id
  // Usamos um join implícito através da FK organization_users.user_id -> profiles.id (ou auth.users.id)
  // Selecionamos dados do perfil ANINHADO
  const { data: studentsData, error: studentsError } = await supabase
    .from('organization_users')
    .select(`
      user_id,
      profiles!inner (
        id,
        name,
        email,
        role,
        created_at
      )
    `)
    .eq('organization_id', organizationId)
    .eq('profiles.role', 'student'); // Filtra para pegar apenas perfis de estudantes

  if (studentsError) {
    console.error('[useManagerStudents] Error fetching students:', studentsError);
    throw new Error(`Failed to fetch students for organization: ${studentsError.message}`);
  }

  console.log('[useManagerStudents] Raw students data fetched:', studentsData);

  // Mapear os dados para o formato esperado, extraindo o perfil aninhado
  const students = studentsData
    ?.map(item => item.profiles) // Extrai o objeto 'profiles'
    .filter((profile): profile is Profile => profile !== null && typeof profile === 'object' && 'id' in profile) // Type guard para garantir que é um Profile válido
    .map(profile => ({
      id: profile.id,
      name: profile.name ?? 'Nome não informado',
      email: profile.email ?? 'Email não informado',
      created_at: profile.created_at ?? new Date().toISOString(),
      // Adicionar outros campos conforme necessário
    })) ?? [];

  console.log('[useManagerStudents] Processed students list:', students);
  return students;
};

// Hook customizado
export const useManagerStudents = () => {
  const { user } = useAuth(); // Pegamos o user autenticado

  return useQuery<ManagerStudentListItem[], Error>({
    queryKey: ['managerStudents', user?.id], // Chave da query inclui o ID do manager
    queryFn: () => {
      if (!user?.id) {
        // Lança um erro ou retorna uma Promise rejeitada se não houver ID
        // TanStack Query lida com isso e coloca o status como 'error'
         return Promise.reject(new Error('User not authenticated'));
         // Alternativa: return Promise.resolve([]); // Retorna lista vazia se preferir
      }
      return fetchManagerStudents(user.id);
    },
    enabled: !!user?.id, // A query só será executada se o user.id existir
    staleTime: 5 * 60 * 1000, // 5 minutos de stale time
    cacheTime: 10 * 60 * 1000, // 10 minutos de cache time
  });
};
