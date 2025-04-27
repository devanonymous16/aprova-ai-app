
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
      console.log('[useStudentExams] Fetching exams for student:', studentId);

      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

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
    exam_position:exam_positions (
      id,
      name,
      vagas,
      salario_inicial,
      exam:exams (
        status,
        exam_institution:exam_institutions (name)
      )
    )
  `)
          .eq('student_id', studentId);

        console.log('[useStudentExams] Resultado BRUTO da query:', { rawData, queryError });

        if (queryError) {
          console.error('[useStudentExams] Erro na query Supabase:', queryError);
          throw queryError;
        }

        console.log('[useStudentExams] Iniciando mapeamento dos dados brutos...');

        const formattedExams: StudentExam[] = rawData?.map((item: any, index: number) => {
          if (index === 0) {
            console.log('[useStudentExams] Estrutura do primeiro item bruto:', item);
          }
          
          const examPosition = Array.isArray(item.exam_position) && item.exam_position.length > 0
            ? item.exam_position[0]
            : null;

          return {
            ...item,
            exam_position: examPosition
          };
        }) || [];

        console.log('[useStudentExams] Mapeamento concluído. Exames formatados:', formattedExams);

        setExams(formattedExams);
        setError(null);

      } catch (err) {
        console.error('[useStudentExams] Erro CATCH no fetchExams:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setExams([]);
        toast.error('Failed to load your exams', {
          description: 'Please try again later'
        });
      } finally {
        console.log('[useStudentExams] fetchExams FINALLY - Setando isLoading=false');
        setLoading(false);
      }
    };

    fetchExams();
  }, [studentId]);

  return { exams, loading, error };
};
