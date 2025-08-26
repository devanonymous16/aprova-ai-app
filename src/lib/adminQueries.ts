// src/lib/adminQueries.ts
import { supabase } from '@/integrations/supabase/client';

// ========================================================================
// INTERFACES / TIPOS DE DADOS
// ========================================================================

export interface TotalQuestionsData {
  total_questoes: number;
}

export interface QuestionEvolutionData {
  dia_turno: string;
  label_eixo_x: string;
  quantidade_cumulativa: number;
}

export interface QuestionsBySubjectData {
  disciplina_id: string;
  disciplina_nome: string;
  quantidade: number;
}

export interface QuestionsByBancaData {
  banca_id: string;
  banca_nome: string;
  quantidade: number;
}

export interface QuestionsByPositionOrganData {
  organ_id: string;
  organ_name: string;
  position_id: string;
  position_name: string;
  quantidade: number;
}

export interface QuestionsByEducationLevelData {
  education_level_id: string;
  education_level_name: string;
  quantidade: number;
}


// ========================================================================
// NOVAS FUNÇÕES DE QUERY OTIMIZADAS (USANDO VIEWS DE SUMARIZAÇÃO)
// ========================================================================

export const getTotalQuestionsFromSummary = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('total_questions_summary')
    .select('total_count')
    .single();

  if (error) {
    console.error('Error fetching total questions summary:', error);
    throw error;
  }
  return data?.total_count || 0;
};

export const getQuestionEvolutionFromSummary = async (): Promise<QuestionEvolutionData[]> => {
  const { data, error } = await supabase
    .from('daily_evolution_summary')
    .select('dia, quantidade_no_dia')
    .order('dia', { ascending: true });

  if (error) {
    console.error('Error fetching question evolution summary:', error);
    throw error;
  }

  let cumulativeTotal = 0;
  return (data || []).map(row => {
    cumulativeTotal += row.quantidade_no_dia;
    return {
      dia_turno: row.dia,
      label_eixo_x: new Date(row.dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }),
      quantidade_cumulativa: cumulativeTotal
    };
  });
};

export const getSubjectSummary = async (): Promise<QuestionsBySubjectData[]> => {
  const { data, error } = await supabase
    .from('subjects_summary')
    .select('id, name, question_count')
    .order('question_count', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching subject summary:', error);
    throw error;
  }

  return (data || []).map(item => ({
    disciplina_id: item.id,
    disciplina_nome: item.name,
    quantidade: item.question_count
  }));
};

/**
 * [FINALMENTE CORRIGIDO] Busca o resumo de questões por banca usando os nomes de coluna corretos.
 */
export const getBancaSummary = async (): Promise<QuestionsByBancaData[]> => {
  const { data, error } = await supabase
    .from('bancas_summary')
    // CORREÇÃO: Usa os nomes de coluna exatos da sua tabela: banca_id, banca_nome, quantidade
    .select('banca_id, banca_nome, quantidade')
    .order('quantidade', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching banca summary:', error);
    throw error;
  }

  // Com os nomes corretos, nenhum mapeamento extra é necessário.
  return data || [];
};


// ========================================================================
// FUNÇÕES ANTIGAS (USANDO RPCs DIRETAS) - Mantidas para referência
// ========================================================================

export const getTotalQuestions = async (): Promise<number> => {
  const { data, error } = await supabase.rpc('get_admin_total_questions');
  if (error) {
    console.error('Error fetching total questions:', error);
    throw error;
  }
  return data as number || 0;
};

export const getQuestionEvolution = async (): Promise<QuestionEvolutionData[]> => {
  const { data, error } = await supabase.rpc('get_admin_question_evolution');
  if (error) {
    console.error('Error fetching question evolution:', error);
    throw error;
  }
  return data || [];
};

export const getQuestionsBySubject = async (): Promise<QuestionsBySubjectData[]> => {
  const { data, error } = await supabase.rpc('get_admin_questions_by_subject');
  if (error) {
    console.error('Error fetching questions by subject:', error);
    throw error;
  }
  return data || [];
};

export const getQuestionsByBanca = async (): Promise<QuestionsByBancaData[]> => {
  const { data, error } = await supabase.rpc('get_admin_questions_by_banca');
  if (error) {
    console.error('Error fetching questions by banca:', error);
    throw error;
  }
  return data || [];
};

export const getQuestionsByPositionOrgan = async (): Promise<QuestionsByPositionOrganData[]> => {
  const { data, error } = await supabase.rpc('get_admin_questions_by_position_organ');
  if (error) {
    console.error('Error fetching questions by position/organ:', error);
    throw error;
  }
  return data || [];
};

export const getQuestionsByEducationLevel = async (): Promise<QuestionsByEducationLevelData[]> => {
  const { data, error } = await supabase.rpc('get_admin_questions_by_education_level');
  if (error) {
    console.error('Error fetching questions by education level:', error);
    throw error;
  }
  return data || [];
};