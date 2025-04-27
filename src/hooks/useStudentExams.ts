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
      console.log('[useStudentExams] Executando query Supabase SIMPLIFICADA (select *)...');

      const { data: rawData, error: queryError } = await supabase
        .from('student_exams')
        .select(`*`) // APENAS O ASTERISCO
        .eq('student_id', studentId);

      console.log('[useStudentExams] Resultado BRUTO da query SIMPLIFICADA:', { rawData, queryError });

      if (queryError) {
        console.error('[useStudentExams] Erro na query Supabase SIMPLIFICADA:', queryError);
        throw queryError;
      }

      if (rawData) {
          console.log('[useStudentExams] Dados brutos recebidos (sem mapeamento):', rawData);
          setExams(rawData as any); // Usando 'as any' APENAS PARA ESTE TESTE
      } else {
          console.log('[useStudentExams] Nenhum dado bruto recebido (query simplificada).');
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
