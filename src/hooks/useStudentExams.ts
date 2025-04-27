import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { StudentExam, ExamPosition, Exam, ExamInstitution } from '@/types/student';
import { toast } from '@/components/ui/sonner';


type StudentExamQueryResult = Omit<StudentExam, 'exam_position'> & {
  exam_position: (Omit<ExamPosition, 'exam'> & {
    exam: (Omit<Exam, 'exam_institution'> & {
      exam_institution: ExamInstitution | null;
    }) | null;
  }) | null;
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
      console.log('[useStudentExams] Executando query Supabase com JOINs CORRIGIDOS...');


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
         console.log('[useStudentExams] Formatando dados recebidos...');

         const typedData = queryData as StudentExamQueryResult[];

         const formattedExams = typedData.map(item => {

           return item as StudentExam;
         });

         console.log('[useStudentExams] Formatação concluída. Exames:', formattedExams);
         setExams(formattedExams);
      } else {
         console.log('[useStudentExams] Nenhum dado recebido da query.');
         setExams([]);
      }

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
  }, [studentId]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { exams, loading, error };
};
