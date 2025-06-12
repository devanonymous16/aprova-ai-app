// src/lib/adminQueries.ts
import { supabase } from '@/integrations/supabase/client'; // Seu cliente Supabase

// Tipos para os retornos das RPCs (para melhor type-safety)
// Estes tipos devem corresponder à cláusula RETURNS TABLE das suas RPCs

export interface TotalQuestionsData {
  total_questoes: number; // Supabase RPC pode retornar bigint como number ou string dependendo do driver/versão
}

export interface QuestionEvolutionData {
  dia_turno: string; // TIMESTAMPTZ (vem como string ISO do Supabase)
  label_eixo_x: string;
  quantidade_cumulativa: number; // bigint é tratado como number pelo JS
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

// 1. Função para buscar o total de questões
export const getTotalQuestions = async (): Promise<number> => {
  const { data, error } = await supabase.rpc('get_admin_total_questions');
  if (error) {
    console.error('Error fetching total questions:', error);
    throw error;
  }
  // A RPC get_admin_total_questions retorna um único valor bigint, 
  // o supabase-js geralmente o retorna como um número diretamente.
  return data as number || 0;
};

// 2. Função para buscar a evolução das questões
export const getQuestionEvolution = async (): Promise<QuestionEvolutionData[]> => {
  const { data, error } = await supabase.rpc('get_admin_question_evolution');
  if (error) {
    console.error('Error fetching question evolution:', error);
    throw error;
  }
  return data || [];
};

// 3. Função para buscar questões por disciplina
export const getQuestionsBySubject = async (): Promise<QuestionsBySubjectData[]> => {
  const { data, error } = await supabase.rpc('get_admin_questions_by_subject');
  if (error) {
    console.error('Error fetching questions by subject:', error);
    throw error;
  }
  return data || [];
};

// 4. Função para buscar questões por banca
export const getQuestionsByBanca = async (): Promise<QuestionsByBancaData[]> => {
  const { data, error } = await supabase.rpc('get_admin_questions_by_banca');
  if (error) {
    console.error('Error fetching questions by banca:', error);
    throw error;
  }
  return data || [];
};

// 5. Função para buscar questões por cargo e órgão (para os filtros e gráfico)
export const getQuestionsByPositionOrgan = async (): Promise<QuestionsByPositionOrganData[]> => {
  const { data, error } = await supabase.rpc('get_admin_questions_by_position_organ');
  if (error) {
    console.error('Error fetching questions by position/organ:', error);
    throw error;
  }
  return data || [];
};

// 6. Função para buscar questões por nível de escolaridade
export const getQuestionsByEducationLevel = async (): Promise<QuestionsByEducationLevelData[]> => {
  const { data, error } = await supabase.rpc('get_admin_questions_by_education_level');
  if (error) {
    console.error('Error fetching questions by education level:', error);
    throw error;
  }
  return data || [];
};