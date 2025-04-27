
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
      const selectString = `
        *,
        exam_position:exam_positions (
          *,
          exam:exams (
            *,
            exam_institution:exam_institutions (
              *
            )
          )
        )
      `;

      const { data: queryData, error: queryError } = await supabase
        .from('student_exams')
        .select(selectString)
        .eq('student_id', studentId);

      if (queryError) {
        console.error('[useStudentExams] Erro na query Supabase:', queryError);
        throw queryError;
      }

      setExams(queryData as StudentExam[] || []);

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
