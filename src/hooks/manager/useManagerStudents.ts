import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// Tentativa de importar Profile de uma localização comum. Ajuste se necessário.
import { Profile } from '@/types/user'; // Se o tipo Profile não estiver em @/types/user, ajuste o path

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
  // Selecionamos dados do perfil ANINHADO usando a relação via organization_users
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
    // Adiciona mais detalhes ao erro se possível
    const errorDetails = studentsError.details ? ` (${studentsError.details})` : '';
    throw new Error(`Failed to fetch students for organization: ${studentsError.message}${errorDetails}`);
  }

  console.log('[useManagerStudents] Raw students data fetched:', studentsData);

  // Mapear os dados para o formato esperado, extraindo o perfil aninhado
  const students = studentsData
    ?.map(item => item.profiles) // Extrai o objeto 'profiles'
    // Type guard mais robusto para garantir que é um Profile válido
    .filter((profile): profile is { id: string; name: string | null; email: string | null; created_at: string | null; role: string | null; } =>
      profile !== null && typeof profile === 'object' && 'id' in profile && 'role' in profile
    )
    .map(profile => ({
      id: profile.id,
      name: profile.name ?? 'Nome não informado',
      email: profile.email ?? 'Email não informado',
      // Garante que created_at seja uma string válida ou use um fallback
      created_at: profile.created_at ?? new Date().toISOString(),
    })) ?? [];

  console.log('[useManagerStudents] Processed students list:', students);
  return students;
};

// Hook customizado
export const useManagerStudents = () => {
  const { user } = useAuth(); // Pegamos o user autenticado

  return useQuery<ManagerStudentListItem[], Error>({
    // Chave da query inclui o ID do manager para invalidar corretamente se o manager mudar
    queryKey: ['managerStudents', user?.id],
    queryFn: () => {
      if (!user?.id) {
         // Retorna uma Promise rejeitada se não houver ID para TanStack Query tratar como erro
         return Promise.reject(new Error('User not authenticated'));
      }
      return fetchManagerStudents(user.id);
    },
    // A query só será habilitada (executada) se o user.id existir
    enabled: !!user?.id,
    // Configurações de cache (opcional, mas bom para performance)
    staleTime: 5 * 60 * 1000, // 5 minutos antes de considerar os dados "stale"
    cacheTime: 10 * 60 * 1000, // 10 minutos para manter os dados em cache inativo
  });
};