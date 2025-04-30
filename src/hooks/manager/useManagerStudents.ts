import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// A importação de 'Profile' FOI REMOVIDA pois não é usada diretamente aqui

// Tipo para os dados retornados pela FUNÇÃO RPC (deve bater com RETURNS TABLE da função SQL)
export interface ManagerStudentListItem {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string; // A função SQL retorna timestamptz, que o JS recebe como string ISO
}

// --- Função que chama a RPC ---
const fetchManagerStudentsViaRpc = async (managerUserId: string): Promise<ManagerStudentListItem[]> => {
  if (!managerUserId) {
    throw new Error('Manager user ID is required');
  }

  console.log('[useManagerStudents RPC] Calling get_students_for_manager for manager:', managerUserId);

  // Chama a função PostgreSQL 'get_students_for_manager'
  const { data, error } = await supabase.rpc('get_students_for_manager', {
    manager_id: managerUserId // Passa o argumento para a função SQL
  });

  // Tratamento de erro da chamada RPC
  if (error) {
    console.error('[useManagerStudents RPC] Error calling RPC function:', error);
    const errorDetails = error.details ? ` (${error.details})` : '';
    const hint = error.hint ? ` Hint: ${error.hint}.` : '';
    // Joga um erro claro para o useQuery capturar
    throw new Error(`Failed to fetch students via RPC: ${error.message}${hint}${errorDetails}`);
  }

  console.log('[useManagerStudents RPC] Data received from RPC:', data);

  // Processa os dados recebidos (garante que é um array e ajusta tipos se necessário)
  const students = (data || []).map(student => ({
      ...student,
      // Garante que created_at seja uma string, mesmo que venha null do DB
      // (embora a coluna no DB seja NOT NULL por padrão)
      created_at: student.created_at ?? new Date().toISOString(),
      // Garante que name e email sejam string ou null (para tipagem)
      name: student.name ?? null,
      email: student.email ?? null,
  }));


  console.log('[useManagerStudents RPC] Processed students list:', students);
  return students; // Retorna a lista processada
};
// --- FIM DA FUNÇÃO RPC ---


// Hook React Query que usa a função RPC
export const useManagerStudents = () => {
  const { user } = useAuth(); // Pega o usuário logado

  // Usa o hook useQuery para buscar os dados
  return useQuery<ManagerStudentListItem[], Error>({
    // Chave única para o cache, incluindo o ID do usuário
    queryKey: ['managerStudents', user?.id],
    // Função que será executada para buscar os dados
    queryFn: () => {
      if (!user?.id) {
         // Se não houver usuário, retorna uma promessa rejeitada
         return Promise.reject(new Error('User not authenticated'));
      }
      // Chama a função que faz a chamada RPC
      return fetchManagerStudentsViaRpc(user.id);
    },
    // A query só é habilitada (executada) se houver um ID de usuário
    enabled: !!user?.id,
    // Configurações de cache (opcional)
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};