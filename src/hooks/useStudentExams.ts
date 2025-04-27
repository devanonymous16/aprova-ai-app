import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StudentExam, ExamPosition, Exam, ExamInstitution } from '@/types/student';
import { toast } from '@/components/ui/sonner';


type SupabaseStudentExamQueryResult = {
  id: any;
  student_id: any;
  exam_id: any;
  exam_position_id: any;
  access_type: any;
  created_at: any;

  exam_positions: {
    id: any;
    name: string;
    vagas: number | null;
    salario_inicial: number | null;
    exam_id: any;
    exam_level_of_education_id: any;
    created_at: any;
    exams: {
      id: any;
      status: string | null;
      exam_institution_id: any;
      exam_date_id: any;
      created_at: any;
      exam_institutions: {
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
      console.log('[useStudentExams] Executando query Supabase com JOINs (sem aliases)...');

      const selectString = `
        id,
        student_id,
        exam_id,
        exam_position_id,
        access_type,
        created_at,
        exam_positions!inner (
          id,
          name,
          vagas,
          salario_inicial,
          exam_id,
          exam_level_of_education_id,
          created_at,
          exams!inner (
            id,
            status,
            exam_institution_id,
            exam_date_id,
            created_at,
            exam_institutions!inner (
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
         console.log('[useStudentExams] Formatando dados recebidos para a estrutura da UI...');

         const typedData = queryData as SupabaseStudentExamQueryResult[];

         const formattedExams: StudentExam[] = typedData.map(item => {
           const positionData = item.exam_positions;
           const examData = positionData?.exams;
           const institutionData = examData?.exam_institutions;


           return {
             id: item.id,
             student_id: item.student_id,
             exam_id: item.exam_id,
             exam_position_id: item.exam_position_id,
             access_type: item.access_type,
             created_at: item.created_at,

             exam_position: positionData ? {
                 id: positionData.id,
                 name: positionData.name,
                 vagas: positionData.vagas,
                 salario_inicial: positionData.salario_inicial,
                 exam_id: positionData.exam_id,
                 exam_level_of_education_id: positionData.exam_level_of_education_id,
                 created_at: positionData.created_at,
                 exam: examData ? {
                     id: examData.id,
                     status: examData.status,
                     exam_institution_id: examData.exam_institution_id,
                     exam_date_id: examData.exam_date_id,
                     created_at: examData.created_at,
                     exam_institution: institutionData ? {
                         id: institutionData.id,
                         name: institutionData.name
                     } : null
                 } : null
             } : null,


           } as StudentExam;
         });

         console.log('[useStudentExams] Mapeamento concluído. Exames formatados:', formattedExams);
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
