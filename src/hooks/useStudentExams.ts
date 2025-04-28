
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StudentExam } from '@/types/student';
import { toast } from '@/components/ui/sonner';

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
      const { data: queryData, error: queryError } = await supabase
        .from('student_exams')
        .select(`
          id,
          student_id,
          exam_id,
          exam_position_id,
          access_type,
          created_at,
          exam_position (
            id,
            name,
            vagas,
            salario_inicial,
            exam_id,
            exam_level_of_education_id,
            created_at,
            exam (
              id,
              status,
              exam_institution_id,
              created_at,
              exam_institution (
                id,
                name,
                logo_institution
              )
            )
          )
        `)
        .eq('student_id', studentId);

      if (queryError) throw queryError;

      const typedData = (queryData || []).map(item => ({
        ...item,
        exam_position: Array.isArray(item.exam_position) 
          ? item.exam_position[0] 
          : item.exam_position
      })) as StudentExam[];

      setExams(typedData);

    } catch (err) {
      console.error('[useStudentExams] Erro CATCH no fetchExams:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setExams([]);
      toast.error('Failed to load your exams', {
        description: 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { exams, loading, error };
};
