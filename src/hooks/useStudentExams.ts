
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
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        console.log('[useStudentExams] Fetching exams for student:', studentId);
        setLoading(true);
        
        const { data, error } = await supabase
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

        if (error) throw error;

        console.log('[useStudentExams] Fetched data:', data);
        setExams(data as StudentExam[] || []);
      } catch (err) {
        console.error('[useStudentExams] Error fetching exams:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error('Failed to load your exams', {
          description: 'Please try again later'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [studentId]);

  return { exams, loading, error };
};
