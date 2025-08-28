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
  quantidade: number;
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
  console.log('🔍 [getQuestionEvolutionFromSummary] Buscando evolução de questões...');

  // Busca questões agrupadas por data de criação
  const { data, error } = await supabase
    .from('questions')
    .select('created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching question evolution:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('🔍 [getQuestionEvolutionFromSummary] Nenhuma questão encontrada');
    return [];
  }

  // Agrupa questões por data
  const questionsByDate: { [key: string]: number } = {};
  
  data.forEach(question => {
    const date = new Date(question.created_at).toISOString().split('T')[0]; // YYYY-MM-DD
    questionsByDate[date] = (questionsByDate[date] || 0) + 1;
  });

  // Converte para array e ordena por data
  const sortedDates = Object.keys(questionsByDate).sort();
  
  // Pega apenas os últimos 60 pontos para não sobrecarregar o gráfico
  const recentDates = sortedDates.slice(-60);
  
  // Calcula valores cumulativos
  let cumulativeTotal = 0;
  
  // Se temos muitas datas, calcula o total inicial até o ponto de corte
  if (sortedDates.length > 60) {
    const initialDates = sortedDates.slice(0, -60);
    cumulativeTotal = initialDates.reduce((sum, date) => sum + questionsByDate[date], 0);
  }
  
  const result = recentDates.map(date => {
    cumulativeTotal += questionsByDate[date];
    return {
      dia_turno: date,
      label_eixo_x: new Date(date + 'T00:00:00Z').toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        timeZone: 'UTC' 
      }),
      quantidade: cumulativeTotal
    };
  });

  console.log('🔍 [getQuestionEvolutionFromSummary] Resultado:', result.slice(0, 5), '... total:', result.length);
  return result;
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

// ========================================================================
// FUNÇÕES PARA AMOSTRA DE QUESTÕES POR BANCA
// ========================================================================

export interface BancaData {
  id: string;
  name: string;
  question_count: number;
}

export interface SubjectForBancaData {
  id: string;
  name: string;
  question_count: number;
}

// Interfaces antigas mantidas para compatibilidade
export interface PositionData {
  id: string;
  name: string;
  institution_name: string;
  institution_id: string;
  question_count: number;
}

export interface SubjectForPositionData {
  id: string;
  name: string;
  question_count: number;
}

// ========================================================================
// NOVAS FUNÇÕES PARA BUSCA POR BANCA
// ========================================================================

export const getAllBancas = async (): Promise<BancaData[]> => {
  console.log('🔍 [getAllBancas] Buscando todas as bancas...');
  
  const { data, error } = await supabase
    .from('exam_bancas')
    .select(`
      id,
      name
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching bancas:', error);
    throw error;
  }

  // Para cada banca, vamos contar as questões separadamente
  const bancasWithCount = await Promise.all(
    (data || []).map(async (banca) => {
      const { count } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .eq('exam_banca_id', banca.id)
        .eq('status', 'active');
      
      return {
        id: banca.id,
        name: banca.name,
        question_count: count || 0
      };
    })
  );

  console.log('🔍 [getAllBancas] Resultado:', bancasWithCount);
  return bancasWithCount;
};

export const getSubjectsForBanca = async (bancaId: string): Promise<SubjectForBancaData[]> => {
  console.log('🔍 [getSubjectsForBanca] Buscando disciplinas para banca:', bancaId);

  const { data, error } = await supabase
    .from('questions')
    .select(`
      exam_subjects!inner (
        id,
        name
      )
    `)
    .eq('exam_banca_id', bancaId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching subjects for banca:', error);
    throw error;
  }

  // Agrupa por disciplina e conta questões
  const subjectCounts: { [key: string]: { id: string; name: string; count: number } } = {};
  
  (data || []).forEach((item: any) => {
    const subject = item.exam_subjects;
    if (subject) {
      if (subjectCounts[subject.id]) {
        subjectCounts[subject.id].count++;
      } else {
        subjectCounts[subject.id] = {
          id: subject.id,
          name: subject.name,
          count: 1
        };
      }
    }
  });

  const result = Object.values(subjectCounts)
    .map(item => ({
      id: item.id,
      name: item.name,
      question_count: item.count
    }))
    .sort((a, b) => b.question_count - a.question_count); // Ordena por quantidade decrescente

  console.log('🔍 [getSubjectsForBanca] Resultado:', result);
  return result;
};

export const getAllPositions = async (): Promise<PositionData[]> => {
  const { data, error } = await supabase
    .from('exam_positions')
    .select(`
      id,
      name,
      exam_institution_id,
      exam_institutions!inner (
        id,
        name
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    institution_name: item.exam_institutions?.name || 'N/A',
    institution_id: item.exam_institution_id,
    question_count: 0 // Será preenchido pelo componente se necessário
  }));
};

export const getSubjectsForPosition = async (positionId: string, institutionId: string): Promise<SubjectForPositionData[]> => {
  console.log('🔍 [getSubjectsForPosition] Tentando busca específica para cargo:', {
    p_institution_id: institutionId,
    p_position_id: positionId
  });

  // Primeira tentativa: busca específica por cargo
  const { data: specificData, error: specificError } = await supabase.rpc('get_subjects_for_position', {
    p_institution_id: institutionId,
    p_position_id: positionId
  });

  console.log('🔍 [getSubjectsForPosition] Resultado da busca específica:', { specificData, specificError });

  if (specificError) {
    console.error('Error fetching subjects for specific position:', specificError);
  }

  // Se a busca específica retornou dados, use ela
  if (specificData && specificData.length > 0) {
    const result = specificData.map((item: any) => ({
      id: item.subject_id,
      name: item.subject_name,
      question_count: item.question_count || 0
    }));
    console.log('🔍 [getSubjectsForPosition] Usando resultado específico:', result);
    return result;
  }

  // Caso contrário, busca todas as disciplinas como fallback
  console.log('🔍 [getSubjectsForPosition] Busca específica vazia, usando fallback (todas as disciplinas)');
  
  const { data: allSubjects, error: allError } = await supabase
    .from('exam_subjects')
    .select(`
      id,
      name,
      questions:questions(count)
    `)
    .order('name', { ascending: true })
    .limit(20);

  if (allError) {
    console.error('Error fetching all subjects:', allError);
    throw allError;
  }

  const fallbackResult = (allSubjects || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    question_count: item.questions?.[0]?.count || 0
  }));

  console.log('🔍 [getSubjectsForPosition] Resultado fallback:', fallbackResult);
  return fallbackResult;
};

// ========================================================================
// FUNÇÃO PARA BUSCAR QUESTÃO ALEATÓRIA
// ========================================================================

export interface RandomQuestionData {
  id: string;
  statement: string;
  item_a: string;
  item_b: string;
  item_c: string;
  item_d: string;
  item_e?: string;
  correct_option: string;
  subject_name: string;
  topic_name?: string;
  banca_name?: string;
  question_position?: string;
  question_institution?: string;
  source_year?: number;
  search_level: 'specific' | 'position_only' | 'general';
}

export const getRandomQuestionByBancaAndSubject = async (
  bancaId: string,
  subjectId: string
): Promise<RandomQuestionData | null> => {
  console.log('🔍 [getRandomQuestionByBancaAndSubject] Buscando questão aleatória:', {
    bancaId,
    subjectId
  });

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      statement,
      item_a,
      item_b,
      item_c,
      item_d,
      item_e,
      correct_option,
      source_year,
      exam_subjects!inner (
        id,
        name
      ),
      exam_topics (
        id,
        name
      ),
      exam_bancas!inner (
        id,
        name
      ),
      exam_positions (
        id,
        name
      ),
      exam_institutions (
        id,
        name
      )
    `)
    .eq('exam_banca_id', bancaId)
    .eq('exam_subject_id', subjectId)
    .eq('status', 'active')
    .limit(1);

  if (error) {
    console.error('Error fetching random question by banca and subject:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('🔍 [getRandomQuestionByBancaAndSubject] Nenhuma questão encontrada');
    return null;
  }

  const question = data[0];
  const result: RandomQuestionData = {
    id: question.id,
    statement: question.statement,
    item_a: question.item_a,
    item_b: question.item_b,
    item_c: question.item_c,
    item_d: question.item_d,
    item_e: question.item_e,
    correct_option: question.correct_option,
    subject_name: question.exam_subjects?.name || 'Disciplina não informada',
    topic_name: question.exam_topics?.name,
    banca_name: question.exam_bancas?.name || 'Banca não informada',
    question_position: question.exam_positions?.name,
    question_institution: question.exam_institutions?.name,
    source_year: question.source_year,
    search_level: 'specific' as const
  };

  console.log('🔍 [getRandomQuestionByBancaAndSubject] Questão encontrada:', result);
  return result;
};

export const getRandomQuestionBySubject = async (
  subjectId: string, 
  positionId?: string, 
  institutionId?: string
): Promise<RandomQuestionData | null> => {
  console.log('🔍 [getRandomQuestionBySubject] Buscando questão aleatória:', {
    subjectId,
    positionId,
    institutionId
  });

  let query = supabase
    .from('questions')
    .select(`
      id,
      statement,
      item_a,
      item_b,
      item_c,
      item_d,
      item_e,
      correct_option,
      exam_subjects!inner (
        id,
        name
      ),
      exam_topics (
        id,
        name
      ),
      exam_bancas (
        id,
        name
      )
    `)
    .eq('exam_subject_id', subjectId)
    .eq('status', 'active');

  // Filtrar por cargo se fornecido
  if (positionId) {
    query = query.eq('exam_position_id', positionId);
  }

  // Filtrar por instituição se fornecido
  if (institutionId) {
    query = query.eq('exam_institution_id', institutionId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    console.error('Error fetching random question:', error);
    throw error;
  }

  // Se não encontrou questão específica, tenta busca mais ampla
  if (!data || data.length === 0) {
    console.log('🔍 [getRandomQuestionBySubject] Nenhuma questão específica encontrada, tentando busca mais ampla...');
    
    // Tenta sem filtro de instituição
    if (positionId && institutionId) {
      console.log('🔍 Tentando sem filtro de instituição...');
      const { data: dataWithoutInstitution } = await supabase
        .from('questions')
        .select(`
          id, statement, item_a, item_b, item_c, item_d, item_e, correct_option,
          exam_subjects!inner (id, name),
          exam_topics (id, name),
          exam_bancas (id, name)
        `)
        .eq('exam_subject_id', subjectId)
        .eq('exam_position_id', positionId)
        .eq('status', 'active')
        .limit(1);
      
      if (dataWithoutInstitution && dataWithoutInstitution.length > 0) {
        console.log('🔍 Encontrou questão sem filtro de instituição');
        const question = dataWithoutInstitution[0];
        return {
          id: question.id,
          statement: question.statement,
          item_a: question.item_a,
          item_b: question.item_b,
          item_c: question.item_c,
          item_d: question.item_d,
          item_e: question.item_e,
          correct_option: question.correct_option,
          subject_name: question.exam_subjects?.name || 'Disciplina não informada',
          topic_name: question.exam_topics?.name,
          banca_name: question.exam_bancas?.name,
          search_level: 'position_only' as const
        };
      }
    }
    
    // Última tentativa: só por disciplina
    console.log('🔍 Última tentativa: só por disciplina...');
    const { data: dataOnlySubject } = await supabase
      .from('questions')
      .select(`
        id, statement, item_a, item_b, item_c, item_d, item_e, correct_option,
        exam_subjects!inner (id, name),
        exam_topics (id, name),
        exam_bancas (id, name),
        exam_positions (id, name),
        exam_institutions (id, name)
      `)
      .eq('exam_subject_id', subjectId)
      .eq('status', 'active')
      .limit(1);
    
    if (!dataOnlySubject || dataOnlySubject.length === 0) {
      console.log('🔍 [getRandomQuestionBySubject] Nenhuma questão encontrada mesmo com busca ampla');
      return null;
    }
    
    console.log('🔍 Encontrou questão com busca só por disciplina');
    const question = dataOnlySubject[0];
    return {
      id: question.id,
      statement: question.statement,
      item_a: question.item_a,
      item_b: question.item_b,
      item_c: question.item_c,
      item_d: question.item_d,
      item_e: question.item_e,
      correct_option: question.correct_option,
      subject_name: question.exam_subjects?.name || 'Disciplina não informada',
      topic_name: question.exam_topics?.name,
      banca_name: question.exam_bancas?.name,
      question_position: question.exam_positions?.name,
      question_institution: question.exam_institutions?.name,
      search_level: 'general' as const
    };
  }

  const question = data[0];
  const result: RandomQuestionData = {
    id: question.id,
    statement: question.statement,
    item_a: question.item_a,
    item_b: question.item_b,
    item_c: question.item_c,
    item_d: question.item_d,
    item_e: question.item_e,
    correct_option: question.correct_option,
    subject_name: question.exam_subjects?.name || 'Disciplina não informada',
    topic_name: question.exam_topics?.name,
    banca_name: question.exam_bancas?.name,
    search_level: 'specific' as const
  };

  console.log('🔍 [getRandomQuestionBySubject] Questão encontrada:', result);
  return result;
};