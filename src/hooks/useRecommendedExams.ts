import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { Exam, ExamInstitution, ExamDate, ExamPosition } from "@/types/student";

type RecommendedExamQueryResult = Exam & {
  exam_institution: Pick<ExamInstitution, 'id' | 'name' | 'logo_institution'> | null;
  exam_date: Pick<ExamDate, 'id' | 'date'> | null;
  exam_positions: Pick<ExamPosition, 'id' | 'name' | 'vagas' | 'salario_inicial'>[] | null;
};

export function useRecommendedExams(enabled: boolean = true) {
  return useQuery<RecommendedExamQueryResult[], Error>({
    queryKey: ['recommendedExams'],
    queryFn: async () => {
      console.log(`[useRecommendedExams] Buscando exames recomendados.`);

      const selectString = `
        id, status, exam_institution_id, exam_date_id, base64Image, /* Colunas de exams */
        exam_institution:exam_institutions ( id, name, logo_institution ),
        exam_date:exam_dates ( id, date ), /* Buscando exam_dates */
        exam_positions ( id, name, vagas, salario_inicial ) /* Colunas de exam_positions */
      `;

      let query = supabase
        .from('exams')
        .select(selectString)
        .in('status', ['aberto', 'previsto']);

      query = query.limit(20); 
      console.log('[useRecommendedExams] Executando query Supabase...');
      const { data, error } = await query;

      console.log('[useRecommendedExams] Resultado query:', { data, error });

      if (error) {
        console.error('[useRecommendedExams] Erro na query:', error);
        toast.error('Erro ao buscar concursos recomendados', { description: error.message });
        throw error;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredData = data?.filter(exam => {
        const examDateStr = exam.exam_date?.date;
        if (!examDateStr) return false;
        try {
          const examDate = new Date(examDateStr);
          examDate.setHours(0,0,0,0);
          return examDate >= today;
        } catch (e) {
          console.error("Erro ao parsear data do exame:", examDateStr, e);
          return false;
        }
      }) || [];

      console.log('[useRecommendedExams] Dados após filtro de data:', filteredData);


      return filteredData.slice(0, 6);

    },
    enabled: enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
