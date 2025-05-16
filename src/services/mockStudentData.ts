// @/services/mockStudentData.ts
import { 
  ExamPosition, 
  StudentExam, 
  Subscription, 
  StudentProgress, 
  Topic,
  Exam
} from "@/types/student"; // Certifique-se que este path e tipos estão corretos

// Mock exam positions
export const mockExamPositions: ExamPosition[] = [
  // ... (seu mockExamPositions existente - sem alterações aqui) ...
  { id: "ep-001", name: "Analista Judiciário", title: "Analista Judiciário", organization: "TJ-SP", department: "Tribunal de Justiça", vacancy_count: 120, vagas: 120, salary: 12000, salario_inicial: 12000, registration_deadline: "2023-08-15", exam_date: "2023-10-20", description: "Concurso para Analista Judiciário do Tribunal de Justiça de São Paulo.", status: "open", image_url: "/assets/tj-sp.jpg", created_at: "2023-05-10", exam_id: "e-001", exam_level_of_education_id: "ele-001", exam: null },
  { id: "ep-002", name: "Técnico Judiciário", title: "Técnico Judiciário", organization: "TRF-3", department: "Tribunal Regional Federal", vacancy_count: 80, vagas: 80, salary: 9500, salario_inicial: 9500, registration_deadline: "2023-09-20", exam_date: "2023-11-25", description: "Concurso para Técnico Judiciário do Tribunal Regional Federal da 3ª Região.", status: "open", image_url: "/assets/trf-3.jpg", created_at: "2023-06-05", exam_id: "e-002", exam_level_of_education_id: "ele-002", exam: null },
  // Adicione mais se necessário
];

// Mock student exams
export const mockStudentExams: StudentExam[] = [
  // ... (seu mockStudentExams existente - sem alterações aqui) ...
  { id: "se-001", student_id: "current-user-id", exam_position_id: "ep-001", exam_id: "e-001", access_type: "premium", status: "active", progress_percentage: 35, created_at: "2023-06-15", updated_at: "2023-07-28", exam_position: mockExamPositions[0] },
  { id: "se-002", student_id: "current-user-id", exam_position_id: "ep-002", exam_id: "e-002", access_type: "basic", status: "active", progress_percentage: 15, created_at: "2023-07-01", updated_at: "2023-07-25", exam_position: mockExamPositions[1] },
];

// Mock subscriptions
export const mockSubscriptions: Subscription[] = [
  // ... (seu mockSubscriptions existente - sem alterações aqui) ...
  { id: "sub-001", student_id: "current-user-id", plan_id: "plan-premium", exam_position_id: "ep-001", status: "active", started_at: "2023-06-15", expires_at: "2024-06-15", created_at: "2023-06-15", updated_at: "2023-06-15" },
  { id: "sub-002", student_id: "current-user-id", plan_id: "plan-basic", exam_position_id: "ep-002", status: "active", started_at: "2023-07-01", expires_at: "2023-10-01", created_at: "2023-07-01", updated_at: "2023-07-01" },
];

// Mock topics
export const mockTopics: Topic[] = [
  // ... (seu mockTopics existente - sem alterações aqui) ...
  { id: "t-001", exam_position_id: "ep-001", title: "Direito Constitucional", description: "Princípios fundamentais, direitos e garantias", weight: 20, created_at: "2023-05-15" },
  { id: "t-002", exam_position_id: "ep-001", title: "Direito Administrativo", description: "Administração pública, licitações", weight: 18, created_at: "2023-05-15" },
];

// Mock student progress
export const mockStudentProgress: StudentProgress[] = [
  // ... (seu mockStudentProgress existente - sem alterações aqui) ...
  { id: "sp-001", student_id: "current-user-id", topic_id: "t-001", correct_questions: 45, total_questions: 60, last_activity: "2023-07-28", created_at: "2023-06-16", updated_at: "2023-07-28", topic: mockTopics[0] },
  { id: "sp-002", student_id: "current-user-id", topic_id: "t-002", correct_questions: 30, total_questions: 55, last_activity: "2023-07-27", created_at: "2023-06-17", updated_at: "2023-07-27", topic: mockTopics[1] },
];

// Helper functions to simulate API calls
export const fetchStudentExams = (studentId: string): Promise<StudentExam[]> => {
  // ... (sua função existente - sem alterações aqui) ...
  return new Promise((resolve) => { setTimeout(() => { resolve(mockStudentExams.filter(exam => exam.student_id === studentId)); }, 500); });
};

export const fetchSuggestedExams = (): Promise<ExamPosition[]> => {
  // ... (sua função existente - sem alterações aqui) ...
  return new Promise((resolve) => { setTimeout(() => { resolve(mockExamPositions.filter(exam => !mockStudentExams.some(se => se.exam_position_id === exam.id))); }, 500); });
};

export const fetchStudentProgress = (studentId: string): Promise<StudentProgress[]> => {
  // ... (sua função existente - sem alterações aqui) ...
  return new Promise((resolve) => { setTimeout(() => { resolve(mockStudentProgress.filter(progress => progress.student_id === studentId)); }, 500); });
};

export const fetchStudentSubscriptions = (studentId: string): Promise<Subscription[]> => {
  // ... (sua função existente - sem alterações aqui) ...
  return new Promise((resolve) => { setTimeout(() => { resolve(mockSubscriptions.filter(sub => sub.student_id === studentId)); }, 500); });
};


// ===== INÍCIO DAS MODIFICAÇÕES =====
// Interface para métricas, para melhor tipagem
interface MetricsType {
  questionsResolved: number;
  practiceDays: { current: number; total: number };
  performance: number;
  ranking: { position: number; total: number };
  practiceTime: { hours: number; minutes: number };
}

export const fetchOverallProgress = async (userId: string, examPositionId?: string | null): Promise<number> => {
  console.log(`[Mock] Fetching overall progress for user ${userId} and position ${examPositionId}`);
  // TODO: Adicione lógica para retornar progresso diferente baseado no examPositionId se desejar
  // Por enquanto, pode retornar um valor fixo ou o mesmo de antes
  if (!examPositionId) return 30; // Valor padrão se não houver cargo em foco, ou 0
  await new Promise(resolve => setTimeout(resolve, 300)); // Simula delay
  
  // Simula progresso diferente por cargo
  if (examPositionId === 'ep-001') return 75; // Analista Judiciário (do seu mockStudentExams)
  if (examPositionId === 'ep-002') return 50; // Técnico Judiciário
  return 60; // Default para outros
};


export const fetchStudentMetrics = async (userId: string, examPositionId?: string | null): Promise<MetricsType> => {
  console.log(`[Mock] Fetching metrics for user ${userId} and position ${examPositionId}`);
  // TODO: Adicione lógica para retornar métricas diferentes baseado no examPositionId
  if (!examPositionId) {
    return { questionsResolved: 0, practiceDays: { current: 0, total: 0 }, performance: 0, ranking: { position: 0, total: 0 }, practiceTime: { hours: 0, minutes: 0 }};
  }
  await new Promise(resolve => setTimeout(resolve, 300));

  // Simula métricas diferentes por cargo
  if (examPositionId === 'ep-001') { // Analista Judiciário
    return {
        questionsResolved: 1250,
        practiceDays: { current: 25, total: 60 },
        performance: 78,
        ranking: { position: 15, total: 230 },
        practiceTime: { hours: 42, minutes: 15 }
    };
  }
  if (examPositionId === 'ep-002') { // Técnico Judiciário
    return {
        questionsResolved: 700,
        practiceDays: { current: 15, total: 45 },
        performance: 70,
        ranking: { position: 22, total: 180 },
        practiceTime: { hours: 30, minutes: 40 }
    };
  }
  // Default para outros
  return {
    questionsResolved: 800,
    practiceDays: { current: 10, total: 30 },
    performance: 65,
    ranking: { position: 30, total: 150 },
    practiceTime: { hours: 20, minutes: 5 }
  };
};
// ===== FIM DAS MODIFICAÇÕES =====


// Mock average progress data for comparison
export const fetchAverageTopicPerformance = (examPositionId: string): Promise<Record<string, number>> => {
  // ... (sua função existente - sem alterações aqui) ...
  return new Promise((resolve) => { setTimeout(() => { const topicAverages: Record<string, number> = { "t-001": 68, "t-002": 62, "t-003": 55, "t-004": 76, "t-005": 58, "t-006": 65, "t-007": 60, "t-008": 70, }; resolve(topicAverages); }, 500); });
};

// Get combined topic performance for student and average
export const getTopicPerformanceComparison = async (studentId: string, examPositionId: string): Promise<any[]> => {
  // ... (sua função existente - sem alterações aqui) ...
  const progress = await fetchStudentProgress(studentId); const averages = await fetchAverageTopicPerformance(examPositionId); return progress.map(p => { const performancePercent = Math.round((p.correct_questions / p.total_questions) * 100); const avgPerformance = averages[p.topic_id] || 60; return { topic: p.topic.title, topicId: p.topic_id, performance: performancePercent, average: avgPerformance, difference: performancePercent - avgPerformance }; }).sort((a, b) => b.difference - a.difference);
};


// Add recommended exams mock data
export const fetchRecommendedExams = (): Promise<Exam[]> => {
  // ... (sua função existente - sem alterações aqui) ...
  return new Promise((resolve) => { setTimeout(() => { const recommendedExams: Exam[] = [ { id: "e-001", status: "open", exam_institution_id: "ei-001", exam_date_id: "ed-001", created_at: "2024-04-27", exam_institution: { id: "ei-001", name: "Tribunal de Justiça de São Paulo", logo_institution: "base64_placeholder_tj_sp" }, exam_date: { id: "ed-001", date: "2024-07-15", registration_start: "2024-05-01", registration_end: "2024-06-01", created_at: "2024-04-27" }, exam_positions: mockExamPositions.filter(p => p.exam_id === "e-001") }, { id: "e-002", status: "upcoming", exam_institution_id: "ei-002", exam_date_id: "ed-002", created_at: "2024-04-27", exam_institution: { id: "ei-002", name: "Tribunal Regional Federal", logo_institution: "base64_placeholder_trf" }, exam_date: { id: "ed-002", date: "2024-08-20", registration_start: "2024-06-01", registration_end: "2024-07-01", created_at: "2024-04-27" }, exam_positions: mockExamPositions.filter(p => p.exam_id === "e-002") } ]; resolve(recommendedExams); }, 500); });
};

// Optionally, update mockExamPositions to include logo_institution in exam
mockExamPositions.forEach(position => {
  position.exam = {
    ...position.exam,
    exam_institution: {
      id: `ei-${position.id}`,
      name: position.organization || 'Unknown Institution',
      logo_institution: `base64_placeholder_${position.id}`
    }
  } as Exam; // Type assertion
});