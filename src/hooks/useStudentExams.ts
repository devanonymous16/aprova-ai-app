import { useEffect, useState, useCallback } from 'react'; // Adicionado useCallback
import { supabase } from '@/integrations/supabase/client';
import { StudentExam, ExamPosition } from '@/types/student'; // Garanta que ExamPosition seja importado se não estiver global
import { toast } from '@/components/ui/sonner';

// Definindo um tipo mais explícito para o retorno da query com joins
// Adapte as propriedades internas se necessário conforme seus tipos reais
type StudentExamQueryResult = {
  id: any;
  student_id: any;
  exam_id: any;
  exam_position_id: any;
  access_type: any;
  created_at: any;
  updated_at: any;
  status: any;                   // Status de student_exams
  progress_percentage: any;      // Progress de student_exams
  exam_position: {              // Objeto único (devido ao !inner)
    id: any;
    name: string;               // Nome do Cargo
    vagas: number | null;       // Vagas
    salario_inicial: number | null; // Salário
    exam_id: any;
    exam_level_of_education_id: any;
    created_at: any;
    exam: {                     // Objeto único
      id: any;
      status: string | null;    // Status de exams
      exam_institution_id: any;
      exam_date_id: any;
      created_at: any;
      exam_institution: {       // Objeto único
        id: any;
        name: string;           // Nome da Instituição
      } | null; // exam_institution pode ser null
    } | null; // exam pode ser null
  } | null; // exam_position pode ser null
};


export const useStudentExams = (studentId: string | undefined) => {
  // Use um tipo mais genérico ou StudentExam se ele já incluir os campos aninhados corretamente
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Usar useCallback para a função fetch, embora com dependência de studentId pode não ser estritamente necessário
  const fetchExams = useCallback(async () => {
    console.log('[useStudentExams] Fetching exams for student:', studentId);

    if (!studentId) {
      console.log('[useStudentExams] studentId NULO, definindo loading=false');
      setLoading(false);
      setExams([]); // Garante que esteja vazio se não houver ID
      return;
    }

    // Garante que setLoading(true) só rode se for buscar dados
    setLoading(true);
    setError(null); // Limpa erro anterior ao tentar buscar

    try {
      console.log('[useStudentExams] Executando query Supabase com JOINs...');

      // String select CORRIGIDA E FINAL
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
        .select(selectString) // USA A STRING CORRETA
        .eq('student_id', studentId);

      console.log('[useStudentExams] Resultado BRUTO da query:', { queryData, queryError });

      if (queryError) {
        console.error('[useStudentExams] Erro na query Supabase:', queryError);
        throw queryError; // Deixa o catch geral tratar
      }

      // Verificação e Mapeamento (agora esperamos objetos aninhados)
      if (queryData) {
         console.log('[useStudentExams] Iniciando formatação dos dados recebidos...');
         // Tipamos o retorno da query para melhor intellisense e segurança
         const typedData = queryData as StudentExamQueryResult[];

         // O mapeamento pode não ser mais necessário se o tipo StudentExam já espera a estrutura aninhada
         // Mas vamos manter uma verificação/formatação básica se necessário
         const formattedExams = typedData.map(item => {
             // A query com !inner JÁ DEVE retornar exam_position como objeto, não array.
             // O mesmo para os joins internos.
             // Adicione validações se os tipos ainda não baterem 100% com StudentExam
             return {
                 ...item,
                 // Garanta que as propriedades aninhadas existam se o tipo StudentExam as exigir
                 exam_position: item.exam_position ? {
                     ...item.exam_position,
                     exam: item.exam_position.exam ? {
                         ...item.exam_position.exam,
                         exam_institution: item.exam_position.exam.exam_institution ?? null
                     } : null
                 } : null
             } as StudentExam; // Faz type assertion para o tipo final esperado pela UI
         });

         console.log('[useStudentExams] Mapeamento/Formatação concluído. Exames:', formattedExams);
         setExams(formattedExams);
      } else {
         console.log('[useStudentExams] Nenhum dado recebido da query.');
         setExams([]);
      }

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
  // A dependência de 'studentId' já está no useEffect externo
  // O useCallback aqui é mais para garantir referência estável se fosse passado como prop
  }, [studentId]); // Depende de studentId para refazer a busca se ele mudar

  useEffect(() => {
    fetchExams();
  }, [fetchExams]); // Executa fetchExams quando a função (ou studentId) muda

  return { exams, loading, error };
};
