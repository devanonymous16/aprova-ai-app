export type ExamPositionStatus = 'pending' | 'active' | 'completed' | 'failed';
export type SubscriptionStatus = 'active' | 'canceled' | 'pending' | 'expired';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'correct' | 'incorrect' | 'skipped';

export interface ExamInstitution {
  id: string;
  name: string;
}

export interface ExamDate {
  id: string;
  date: string;
  registration_start: string;
  registration_end: string;
  created_at: string;
}

export interface Exam {
  id: string;
  status: 'open' | 'closed' | 'upcoming';
  exam_institution_id: string;
  exam_date_id: string;
  created_at: string;
  exam_institution: ExamInstitution;
  exam_date: ExamDate;
  exam_positions: ExamPosition[];
}

export interface ExamPosition {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  department?: string;
  vagas: number | null;
  salario_inicial: number | null;
  vacancy_count?: number;
  salary?: number;
  exam_id: string;
  exam_level_of_education_id: string;
  exam_date?: string;
  registration_deadline?: string;
  description?: string;
  created_at: string;
  exam: Exam | null;
  status?: 'open' | 'closed' | 'upcoming';
  image_url?: string;
}

export interface StudentExam {
  id: string;
  student_id: string;
  exam_id: string;
  exam_position_id: string;
  access_type: string;
  created_at: string;
  exam_position: ExamPosition | null;
  progress_percentage?: number;
  status?: ExamPositionStatus;
  updated_at?: string;
}

export interface Topic {
  id: string;
  exam_position_id: string;
  title: string;
  description?: string;
  weight?: number;
  created_at: string;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  weight?: number;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  topic_id: string;
  subtopic_id?: string;
  correct_questions: number;
  total_questions: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
  topic: Topic;
  subtopic?: Subtopic;
}

export interface Question {
  id: string;
  subtopic_id: string;
  content: string;
  options: string[];
  correct_option: number;
  difficulty: QuestionDifficulty;
  explanation?: string;
  created_at: string;
}

export interface StudentQuestion {
  id: string;
  student_id: string;
  question_id: string;
  student_answer?: number;
  status: QuestionStatus;
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
  question: Question;
}

export interface AutodiagnosisResult {
  id: string;
  student_id: string;
  exam_position_id: string;
  result_data: {
    topics: {
      topic_id: string;
      score: number;
    }[];
  };
  created_at: string;
}

export interface StudyPlan {
  id: string;
  student_id: string;
  exam_position_id: string;
  weekly_hours: number;
  target_date?: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  student_id: string;
  subtopic_id: string;
  duration_minutes: number;
  completed_questions: number;
  correct_questions: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface EducationLevel {
  id: string;
  name: string;
  promo_price: number;
  full_price: number;
}

export interface ExamLevelData {
  exam: {
    title: string;
    organization: string;
    exam_level_of_education_id: string;
    description?: string;
  };
  educationLevel: EducationLevel | null;
}

export interface Subscription {
  id: string;
  student_id: string;
  plan_id: string;
  exam_position_id: string;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}
