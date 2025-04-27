import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StudentExam, ExamPosition } from '@/types/student';
import { toast } from '@/components/ui/sonner';

type StudentExamQueryResult = {
  id: any;
  student_id: any;
  exam_id: any;
  exam_position_id: any;
  access_type: any;
  created_at: any;
  updated_at: any;
  status: any;
  progress_percentage: any;
  exam_position: {
    id: any;
    name: string;
    vagas: number | null;
    salario_inicial: number | null;
    exam_id: any;
    exam_level_of_education_id: any;
    created_at: any;
    exam: {
      id: any;
      status: string | null;
      exam_institution_id: any;
      exam_date_id: any;
      created_at: any;
      exam_institution: {
        id: any;
        name: string;
      } | null;
    } | null;
  } | null;
};


export const useStudentExams = (studentId: string | undefined) => {

  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExams = useCallback(async () => {
    console.log('[useStudentExams] Fetching exams for student:', studentId);

    if (!studentId) {
      console.log('[useStudentExams] studentId NULO, definindo loading=false');
      setLoading(false);
      setExams([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useStudentExams] Executando query Supabase com JOINs...');

      const selectString = `
        id,
        student_id,
        exam_id,
        exam_position_id,
        access_type,
        created_at,
        updated_at,
        status,
        progress_percentage,
        exam_position:exam_positions!inner (
          id,
          name,
          vagas,
          salario_inicial,
          exam_id,
          exam_level_of_education_id,
          created_at,
          exam:exams!inner (
            id,
            status,
            exam_institution_id,
            exam_date_id,
            created_at,
            exam_institution:exam_institutions!inner (
              id,
              name
            )
          )
        )
      `;

      const { data: queryData, error: queryError } = await supabase
        .from('student_exams')
        .select(selectString)
        .eq('student_id', studentId);

      console.log('[useStudentExams] Resultado BRUTO da query:', { queryData, queryError });

      if (queryError) {
        console.error('[useStudentExams] Erro na query Supabase:', queryError);
        throw queryError;
      }

      if (queryData) {
         console.log('[useStudentExams] Iniciando formatação dos dados recebidos...');

         const typedData = queryData as StudentExamQueryResult[];

         const formattedExams = typedData.map(item => {

             return {
                 ...item,

                 exam_position: item.exam_position ? {
                     ...item.exam_position,
                     exam: item.exam_position.exam ? {
                         ...item.exam_position.exam,
                         exam_institution: item.exam_position.exam.exam_institution ?? null
                     } : null
                 } : null
             } as StudentExam;
         });

         console.log('[useStudentExams] Mapeamento/Formatação concluído. Exames:', formattedExams);
         setExams(formattedExams);
      } else {
         console.log('[useStudentExams] Nenhum dado recebido da query.');
         setExams([]);
      }

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

  }, [studentId]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { exams, loading, error };
};
