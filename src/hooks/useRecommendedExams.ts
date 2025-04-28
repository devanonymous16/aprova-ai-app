import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { Exam, ExamInstitution, ExamDate, ExamPosition } from "@/types/student";
import { toast } from "@/components/ui/sonner";

// Tipo do resultado da query, esperando objetos únicos para institution e date
type RecommendedExamQueryResult = Omit<Exam, 'exam_institution' | 'exam_date' | 'exam_positions'> & {
  exam_institution: Pick<ExamInstitution, 'id' | 'name' | 'logo_institution'> | null;
  exam_date: Pick<ExamDate, 'id' | 'date'> | null;
  exam_positions: Pick<ExamPosition, 'id' | 'name' | 'vagas' | 'salario_inicial'>[] | null;
};

// O tipo Exam em @/types/student precisa refletir que exam_institution e exam_date são objetos
// export interface Exam {
//   ... outros campos ...
//   exam_institution: ExamInstitution | null;
//   exam_date: ExamDate | null;
//   exam_positions: ExamPosition[] | null;
// }


export function useRecommendedExams(searchQuery: string = "", enabled: boolean = true) {
  return useQuery<RecommendedExamQueryResult[], Error>({
    queryKey: ['recommendedExams', searchQuery], // Inclui searchQuery para re-buscar
    queryFn: async () => {
      console.log(`[useRecommendedExams] Buscando exames recomendados. Search: "${searchQuery}"`);

      // String select explícita e com joins !inner para forçar objetos
      const selectString = `
        id,
        status,
        exam_institution_id,
        exam_date_id,
        created_at,
        exam_institution:exam_institutions!inner (
          id,
          name,
          logo_institution
        ),
        exam_date:exam_dates!inner (
          id,
          date
        ),
        exam_positions (
          id,
          name,
          vagas,
          salario_inicial
        )
      `;

      let query = supabase
        .from('exams')
        .select(selectString)
        // Filtro de status corrigido
        .in('status', ['aberto', 'previsto']);

      // Filtro de busca (PODE AINDA CAUSAR 400 - implementar via RPC é melhor)
      // Vamos deixar comentado por enquanto para garantir que o resto funcione
      // if (searchQuery) {
      //   query = query.or(`exam_positions.name.ilike.%${searchQuery}%,exam_institutions.name.ilike.%${searchQuery}%`);
      //   console.log('[useRecommendedExams] Aplicando filtro de busca (PODE FALHAR):', searchQuery);
      // }

      // Limite para paginação inicial
      query = query.limit(20); // Busca mais para filtrar data no frontend

      console.log('[useRecommendedExams] Executando query Supabase...');
      const { data, error } = await query;

      console.log('[useRecommendedExams] Resultado query:', { data, error });

      if (error) {
        console.error('[useRecommendedExams] Erro na query:', error);
        toast.error('Erro ao buscar concursos recomendados', { description: error.message });
        throw error;
      }

      // Filtro de data APLICADO NO FRONTEND
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredData = data?.filter(exam => {
        const examDateStr = exam.exam_date?.date; // Acesso direto, pois !inner deve trazer objeto
        if (!examDateStr) {
          console.warn(`[useRecommendedExams] Exame ID ${exam.id} sem data, removendo.`);
          return false;
        }
        try {
          const examDate = new Date(examDateStr);
          examDate.setHours(0,0,0,0); // Zera hora para comparar só data
          const shouldKeep = examDate >= today;
          // Log do filtro de data
          // console.log(`[useRecommendedExams] Filtrando Exame ID ${exam.id}: Data ${examDateStr} >= Hoje? ${shouldKeep}`);
          return shouldKeep;
        } catch (e) {
          console.error("[useRecommendedExams] Erro ao parsear/comparar data:", examDateStr, e);
          return false;
        }
      }) || [];

      console.log(`[useRecommendedExams] Dados após filtro de data: ${filteredData.length} exames.`);

      // Ordenação pode ser feita aqui se necessário, mas vamos omitir por agora
      // Ex: filteredData.sort((a, b) => maiorVaga(b) - maiorVaga(a));

      // Retorna os primeiros 6 após filtrar
      return filteredData.slice(0, 6);

    },
    enabled: enabled, // Usa o parâmetro passado
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}
