
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StudentExam } from '@/types/student';
import { toast } from '@/components/ui/sonner';

export const useStudentExams = (studentId: string | undefined) => {
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
        const fetchExams = async () => {
      // Log inicial (já deve existir, confirme)
      console.log('[useStudentExams] Fetching exams for student:', studentId);

      if (!studentId) {
        setLoading(false);
        return;
      }

      // Try/Catch/Finally (já deve existir)
      try {
        setLoading(true); // Loading true no início do try

        // Log ANTES da Query (Adicione esta linha)
        console.log('[useStudentExams] Executando query Supabase...');

        const { data: rawData, error: queryError } = await supabase
          .from('student_exams')
          .select(`
            id,
            student_id,
            exam_position_id,
            status,
            progress_percentage,
            created_at,
            updated_at,
            exam_position:exam_positions(
              id,
              title,
              organization,
              department,
              vacancy_count,
              salary,
              registration_deadline,
              exam_date,
              description,
              status,
              image_url,
              created_at
            )
          `)
          .eq('student_id', studentId);

        // Log do Resultado BRUTO (Adicione esta linha)
        console.log('[useStudentExams] Resultado BRUTO da query:', { rawData, queryError });

        // Tratamento de erro da query (já deve existir, confirme)
        if (queryError) {
          // Log no ERRO da Query (Adicione/Confirme esta linha dentro do if)
          console.error('[useStudentExams] Erro na query Supabase:', queryError);
          throw queryError; // Re-lança o erro para ser pego pelo catch geral
        }

        // Log ANTES do Mapeamento (Adicione esta linha)
        console.log('[useStudentExams] Iniciando mapeamento dos dados brutos...');

        // Mapeamento Manual (já deve existir, adicione o log interno)
        const formattedExams: StudentExam[] = rawData?.map((item: any, index: number) => { // Adicione 'index'
          // Log Dentro do Mapeamento (Primeiro Item) (Adicione este if)
          if (index === 0) {
            console.log('[useStudentExams] Estrutura do primeiro item bruto:', item);
          }
          // Lógica existente de mapeamento
          const examPosition = Array.isArray(item.exam_position) && item.exam_position.length > 0
            ? item.exam_position[0]
            : null;

          return {
            ...item,
            exam_position: examPosition
          };
        }) || [];

        // Log APÓS o Mapeamento (Adicione esta linha)
        console.log('[useStudentExams] Mapeamento concluído. Exames formatados:', formattedExams);

        // Setar o estado (já deve existir)
        setExams(formattedExams);
        setError(null); // Limpa erro anterior se sucesso

      } catch (err) {
        // Log no CATCH geral (já deve existir, confirme)
        console.error('[useStudentExams] Erro CATCH no fetchExams:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setExams([]); // Limpa exames em caso de erro
        toast.error('Failed to load your exams', { // Toast existente
          description: 'Please try again later'
        });
      } finally {
        // Log no FINALLY (Adicione/Confirme esta linha)
        console.log('[useStudentExams] fetchExams FINALLY - Setando isLoading=false');
        // Setar loading para false (já deve existir)
        setLoading(false);
      }
    };

    // Chamada fetchExams (já deve existir)
    fetchExams();
  }, [studentId]);

  return { exams, loading, error };
};
