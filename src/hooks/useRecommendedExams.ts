
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { Exam } from "@/types/student";

export function useRecommendedExams(searchQuery: string = '') {
  return useQuery({
    queryKey: ['recommendedExams', searchQuery],
    queryFn: async () => {
      const selectString = `
        *,
        exam_institution:exam_institutions (
          id,
          name,
          logo_institution
        ),
        exam_date:exam_dates (*),
        exam_positions (
          *
        )
      `;

      let query = supabase
        .from('exams')
        .select(selectString)
        .in('status', ['open', 'upcoming'])
        .gte('exam_date.date', new Date().toISOString());

      if (searchQuery) {
        query = query.or(`exam_positions.name.ilike.%${searchQuery}%,exam_institution.name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query
        .order('exam_positions.vagas', { ascending: false })
        .order('exam_positions.salario_inicial', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Exam[];
    },
  });
}
