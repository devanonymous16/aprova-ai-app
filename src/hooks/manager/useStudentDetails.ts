// src/hooks/manager/useStudentDetails.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tipo que espelha as colunas retornadas pela função RPC get_student_details_for_manager
// Ajuste os tipos (especialmente datas/booleanos) conforme necessário
export interface StudentDetailsData {
  profile_id: string;
  profile_name: string | null;
  profile_email: string | null;
  profile_avatar_url: string | null;
  profile_birth_date: string | null; // Mantido como string
  profile_cpf: string | null;
  profile_role: string | null;
  profile_created_at: string | null;
  student_id: string | null; // Pode ser null se LEFT JOIN falhar
  student_date_of_birth: string | null; // Date vem como string
  student_phone_number: string | null;
  student_guardian_name: string | null;
  student_confirmed: boolean | null;
  student_unit_id: string | null;
  student_created_at: string | null; // Timestamp vem como string
}

// Função para chamar a RPC
const fetchStudentDetails = async (studentId: string | null | undefined): Promise<StudentDetailsData | null> => {
  if (!studentId) {
    console.log('[fetchStudentDetails] studentId ausente, não buscando.');
    return null; // Retorna null se não houver ID
  }

  console.log('[fetchStudentDetails] Chamando RPC get_student_details_for_manager para:', studentId);
  const { data, error } = await supabase.rpc('get_student_details_for_manager', {
    p_student_id: studentId
  });

  if (error) {
    console.error('[fetchStudentDetails] Erro na chamada RPC:', error);
    throw new Error(`Falha ao buscar detalhes do aluno: ${error.message}`);
  }

  console.log('[fetchStudentDetails] Dados recebidos da RPC:', data);

  // A RPC retorna um array, mesmo que seja um único resultado ou vazio
  if (data && data.length > 0) {
    // Retorna o primeiro (e único esperado) registro
    // Fazemos um cast aqui, assumindo que a RPC retorna o tipo correto
    return data[0] as StudentDetailsData;
  } else {
    console.log('[fetchStudentDetails] Nenhum dado retornado pela RPC (Aluno não encontrado ou sem permissão).');
    return null; // Retorna null se nenhum dado for encontrado
  }
};

// Hook React Query
export const useStudentDetails = (studentId: string | null | undefined) => {
  return useQuery<StudentDetailsData | null, Error>({
    queryKey: ['studentDetails', studentId], // Chave inclui o ID do aluno
    queryFn: () => fetchStudentDetails(studentId),
    enabled: !!studentId, // Só executa se studentId for truthy
    staleTime: 5 * 60 * 1000, // 5 minutos
    // Não usamos placeholderData aqui, trataremos null/loading na UI
  });
};