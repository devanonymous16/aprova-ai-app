
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { Exam, ExamInstitution, ExamDate, ExamPosition } from "@/types/student";
import { toast } from "@/components/ui/sonner";

type RecommendedExamQueryResult = Omit<Exam, 'exam_institution' | 'exam_date' | 'exam_positions'> & {
  exam_institution: Pick<ExamInstitution, 'id' | 'name' | 'logo_institution'>;
  exam_date: Pick<ExamDate, 'id' | 'date'>;
  exam_positions: Pick<ExamPosition, 'id' | 'name' | 'vagas' | 'salario_inicial'>[];
};

export function useRecommendedExams(searchQuery: string = "", enabled: boolean = true) {
  return useQuery<RecommendedExamQueryResult[], Error>({
    queryKey: ['recommendedExams', searchQuery],
    queryFn: async () => {
      console.log(`[useRecommendedExams] Buscando exames recomendados. Search: "${searchQuery}"`);

      const { data, error } = await supabase
        .from('exams')
        .select(`
          id,
          status,
          exam_institution_id,
          exam_date_id,
          created_at,
          exam_institution (
            id,
            name,
            logo_institution
          ),
          exam_date (
            id,
            date
          ),
          exam_positions (
            id,
            name,
            vagas,
            salario_inicial
          )
        `)
        .in('status', ['aberto', 'previsto'])
        .limit(20);

      if (error) {
        console.error('[useRecommendedExams] Erro na query:', error);
        toast.error('Erro ao buscar concursos recomendados', { description: error.message });
        throw error;
      }

      // Filter by date in the frontend
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredData = data?.filter(exam => {
        if (!exam.exam_date?.date) return false;
        
        try {
          const examDate = new Date(exam.exam_date.date);
          examDate.setHours(0, 0, 0, 0);
          return examDate >= today;
        } catch (e) {
          console.error("[useRecommendedExams] Erro ao parsear data:", e);
          return false;
        }
      }) || [];

      return filteredData.slice(0, 6);
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
