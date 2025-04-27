import { 
  ExamPosition, 
  StudentExam, 
  Subscription, 
  StudentProgress, 
  Topic,
  Exam
} from "@/types/student";

// Mock exam positions
export const mockExamPositions: ExamPosition[] = [
  {
    id: "ep-001",
    name: "Analista Judiciário",
    title: "Analista Judiciário",
    organization: "TJ-SP",
    department: "Tribunal de Justiça",
    vacancy_count: 120,
    vagas: 120,
    salary: 12000,
    salario_inicial: 12000,
    registration_deadline: "2023-08-15",
    exam_date: "2023-10-20",
    description: "Concurso para Analista Judiciário do Tribunal de Justiça de São Paulo.",
    status: "open",
    image_url: "/assets/tj-sp.jpg",
    created_at: "2023-05-10",
    exam_id: "e-001",
    exam_level_of_education_id: "ele-001",
    exam: null
  },
  {
    id: "ep-002",
    name: "Técnico Judiciário",
    title: "Técnico Judiciário",
    organization: "TRF-3",
    department: "Tribunal Regional Federal",
    vacancy_count: 80,
    vagas: 80,
    salary: 9500,
    salario_inicial: 9500,
    registration_deadline: "2023-09-20",
    exam_date: "2023-11-25",
    description: "Concurso para Técnico Judiciário do Tribunal Regional Federal da 3ª Região.",
    status: "open",
    image_url: "/assets/trf-3.jpg",
    created_at: "2023-06-05",
    exam_id: "e-002",
    exam_level_of_education_id: "ele-002",
    exam: null
  },
  {
    id: "ep-003",
    name: "Auditor Fiscal",
    title: "Auditor Fiscal",
    organization: "Receita Federal",
    department: "Ministério da Economia",
    vacancy_count: 150,
    vagas: 150,
    salary: 21000,
    salario_inicial: 21000,
    registration_deadline: "2023-10-10",
    exam_date: "2023-12-10",
    description: "Concurso para Auditor Fiscal da Receita Federal do Brasil.",
    status: "upcoming",
    image_url: "/assets/receita.jpg",
    created_at: "2023-07-01",
    exam_id: "e-003",
    exam_level_of_education_id: "ele-003",
    exam: null
  },
  {
    id: "ep-004",
    name: "Escrivão de Polícia",
    title: "Escrivão de Polícia",
    organization: "Polícia Civil",
    department: "Secretaria de Segurança Pública",
    vacancy_count: 200,
    vagas: 200,
    salary: 8500,
    salario_inicial: 8500,
    registration_deadline: "2023-07-20",
    exam_date: "2023-09-15",
    description: "Concurso para Escrivão da Polícia Civil do Estado de São Paulo.",
    status: "closed",
    image_url: "/assets/policia-civil.jpg",
    created_at: "2023-04-15",
    exam_id: "e-004",
    exam_level_of_education_id: "ele-004",
    exam: null
  },
  {
    id: "ep-005",
    name: "Agente Administrativo",
    title: "Agente Administrativo",
    organization: "MPU",
    department: "Ministério Público da União",
    vacancy_count: 100,
    vagas: 100,
    salary: 7500,
    salario_inicial: 7500,
    registration_deadline: "2023-11-10",
    exam_date: "2024-01-15",
    description: "Concurso para Agente Administrativo do Ministério Público da União.",
    status: "upcoming",
    image_url: "/assets/mpu.jpg",
    created_at: "2023-07-15",
    exam_id: "e-005",
    exam_level_of_education_id: "ele-005",
    exam: null
  }
];

// Mock student exams
export const mockStudentExams: StudentExam[] = [
  {
    id: "se-001",
    student_id: "current-user-id",
    exam_position_id: "ep-001",
    exam_id: "e-001",
    access_type: "premium",
    status: "active",
    progress_percentage: 35,
    created_at: "2023-06-15",
    updated_at: "2023-07-28",
    exam_position: mockExamPositions[0]
  },
  {
    id: "se-002",
    student_id: "current-user-id",
    exam_position_id: "ep-002",
    exam_id: "e-002",
    access_type: "basic",
    status: "active",
    progress_percentage: 15,
    created_at: "2023-07-01",
    updated_at: "2023-07-25",
    exam_position: mockExamPositions[1]
  }
];

// Mock subscriptions
export const mockSubscriptions: Subscription[] = [
  {
    id: "sub-001",
    student_id: "current-user-id",
    plan_id: "plan-premium",
    exam_position_id: "ep-001",
    status: "active",
    started_at: "2023-06-15",
    expires_at: "2024-06-15",
    created_at: "2023-06-15",
    updated_at: "2023-06-15"
  },
  {
    id: "sub-002",
    student_id: "current-user-id",
    plan_id: "plan-basic",
    exam_position_id: "ep-002",
    status: "active",
    started_at: "2023-07-01",
    expires_at: "2023-10-01",
    created_at: "2023-07-01",
    updated_at: "2023-07-01"
  }
];

// Mock topics
export const mockTopics: Topic[] = [
  { id: "t-001", exam_position_id: "ep-001", title: "Direito Constitucional", description: "Princípios fundamentais, direitos e garantias", weight: 20, created_at: "2023-05-15" },
  { id: "t-002", exam_position_id: "ep-001", title: "Direito Administrativo", description: "Administração pública, licitações", weight: 18, created_at: "2023-05-15" },
  { id: "t-003", exam_position_id: "ep-001", title: "Direito Processual Civil", description: "Processo de conhecimento, recursos", weight: 15, created_at: "2023-05-16" },
  { id: "t-004", exam_position_id: "ep-001", title: "Português", description: "Interpretação de textos, gramática", weight: 15, created_at: "2023-05-16" },
  { id: "t-005", exam_position_id: "ep-001", title: "Raciocínio Lógico", description: "Lógica de argumentação, probabilidade", weight: 12, created_at: "2023-05-17" },
  { id: "t-006", exam_position_id: "ep-002", title: "Noções de Direito", description: "Direito Constitucional e Administrativo", weight: 20, created_at: "2023-06-10" },
  { id: "t-007", exam_position_id: "ep-002", title: "Conhecimentos Específicos", description: "Atribuições do cargo", weight: 25, created_at: "2023-06-11" },
  { id: "t-008", exam_position_id: "ep-002", title: "Informática", description: "Sistemas operacionais, pacote Office", weight: 15, created_at: "2023-06-12" }
];

// Mock student progress
export const mockStudentProgress: StudentProgress[] = [
  {
    id: "sp-001",
    student_id: "current-user-id",
    topic_id: "t-001",
    correct_questions: 45,
    total_questions: 60,
    last_activity: "2023-07-28",
    created_at: "2023-06-16",
    updated_at: "2023-07-28",
    topic: mockTopics[0]
  },
  {
    id: "sp-002",
    student_id: "current-user-id",
    topic_id: "t-002",
    correct_questions: 30,
    total_questions: 55,
    last_activity: "2023-07-27",
    created_at: "2023-06-17",
    updated_at: "2023-07-27",
    topic: mockTopics[1]
  },
  {
    id: "sp-003",
    student_id: "current-user-id",
    topic_id: "t-003",
    correct_questions: 25,
    total_questions: 50,
    last_activity: "2023-07-25",
    created_at: "2023-06-18",
    updated_at: "2023-07-25",
    topic: mockTopics[2]
  },
  {
    id: "sp-004",
    student_id: "current-user-id",
    topic_id: "t-004",
    correct_questions: 40,
    total_questions: 50,
    last_activity: "2023-07-26",
    created_at: "2023-06-19",
    updated_at: "2023-07-26",
    topic: mockTopics[3]
  },
  {
    id: "sp-005",
    student_id: "current-user-id",
    topic_id: "t-005",
    correct_questions: 18,
    total_questions: 30,
    last_activity: "2023-07-23",
    created_at: "2023-06-20",
    updated_at: "2023-07-23",
    topic: mockTopics[4]
  },
  {
    id: "sp-006",
    student_id: "current-user-id",
    topic_id: "t-006",
    correct_questions: 15,
    total_questions: 40,
    last_activity: "2023-07-24",
    created_at: "2023-07-01",
    updated_at: "2023-07-24",
    topic: mockTopics[5]
  },
  {
    id: "sp-007",
    student_id: "current-user-id",
    topic_id: "t-007",
    correct_questions: 20,
    total_questions: 50,
    last_activity: "2023-07-25",
    created_at: "2023-07-02",
    updated_at: "2023-07-25",
    topic: mockTopics[6]
  }
];

// Helper functions to simulate API calls
export const fetchStudentExams = (studentId: string): Promise<StudentExam[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStudentExams.filter(exam => exam.student_id === studentId));
    }, 500);
  });
};

export const fetchSuggestedExams = (): Promise<ExamPosition[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockExamPositions.filter(exam => !mockStudentExams.some(se => se.exam_position_id === exam.id)));
    }, 500);
  });
};

export const fetchStudentProgress = (studentId: string): Promise<StudentProgress[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStudentProgress.filter(progress => progress.student_id === studentId));
    }, 500);
  });
};

export const fetchStudentSubscriptions = (studentId: string): Promise<Subscription[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSubscriptions.filter(sub => sub.student_id === studentId));
    }, 500);
  });
};

export const fetchOverallProgress = (studentId: string): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const exams = mockStudentExams.filter(exam => exam.student_id === studentId);
      if (exams.length === 0) {
        resolve(0);
      } else {
        const totalProgress = exams.reduce((total, exam) => total + exam.progress_percentage, 0);
        resolve(totalProgress / exams.length);
      }
    }, 500);
  });
};

// Mock average progress data for comparison
export const fetchAverageTopicPerformance = (examPositionId: string): Promise<Record<string, number>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const topicAverages: Record<string, number> = {
        "t-001": 68, // Direito Constitucional
        "t-002": 62, // Direito Administrativo
        "t-003": 55, // Direito Processual Civil
        "t-004": 76, // Português
        "t-005": 58, // Raciocínio Lógico
        "t-006": 65, // Noções de Direito
        "t-007": 60, // Conhecimentos Específicos
        "t-008": 70, // Informática
      };
      resolve(topicAverages);
    }, 500);
  });
};

// Get combined topic performance for student and average
export const getTopicPerformanceComparison = async (studentId: string, examPositionId: string): Promise<any[]> => {
  const progress = await fetchStudentProgress(studentId);
  const averages = await fetchAverageTopicPerformance(examPositionId);
  
  return progress.map(p => {
    const performancePercent = Math.round((p.correct_questions / p.total_questions) * 100);
    const avgPerformance = averages[p.topic_id] || 60; // Default to 60% if no average data
    
    return {
      topic: p.topic.title,
      topicId: p.topic_id,
      performance: performancePercent,
      average: avgPerformance,
      difference: performancePercent - avgPerformance
    };
  }).sort((a, b) => b.difference - a.difference);
};

// New mock metrics data
export const fetchStudentMetrics = (studentId: string): Promise<{
  questionsResolved: number;
  practiceDays: { current: number; total: number };
  performance: number;
  ranking: { position: number; total: number };
  practiceTime: { hours: number; minutes: number };
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        questionsResolved: 1250,
        practiceDays: { current: 25, total: 60 },
        performance: 78,
        ranking: { position: 15, total: 230 },
        practiceTime: { hours: 42, minutes: 15 }
      });
    }, 500);
  });
};

// Add recommended exams mock data
export const fetchRecommendedExams = (): Promise<Exam[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recommendedExams: Exam[] = [
        {
          id: "e-001",
          status: "open",
          exam_institution_id: "ei-001",
          exam_date_id: "ed-001",
          created_at: "2024-04-27",
          exam_institution: {
            id: "ei-001",
            name: "Tribunal de Justiça de São Paulo",
            logo_institution: "base64_placeholder_tj_sp" // Added logo_institution
          },
          exam_date: {
            id: "ed-001",
            date: "2024-07-15",
            registration_start: "2024-05-01",
            registration_end: "2024-06-01",
            created_at: "2024-04-27"
          },
          exam_positions: mockExamPositions.filter(p => p.exam_id === "e-001")
        },
        {
          id: "e-002",
          status: "upcoming",
          exam_institution_id: "ei-002",
          exam_date_id: "ed-002",
          created_at: "2024-04-27",
          exam_institution: {
            id: "ei-002",
            name: "Tribunal Regional Federal",
            logo_institution: "base64_placeholder_trf" // Added logo_institution
          },
          exam_date: {
            id: "ed-002",
            date: "2024-08-20",
            registration_start: "2024-06-01",
            registration_end: "2024-07-01",
            created_at: "2024-04-27"
          },
          exam_positions: mockExamPositions.filter(p => p.exam_id === "e-002")
        }
      ];
      
      resolve(recommendedExams);
    }, 500);
  });
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
  } as Exam;
});
