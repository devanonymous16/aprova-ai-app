
export type ExamPositionStatus = 'pending' | 'active' | 'completed' | 'failed';
export type SubscriptionStatus = 'active' | 'canceled' | 'pending' | 'expired';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'correct' | 'incorrect' | 'skipped';

export interface ExamPosition {
  id: string;
  title: string;
  organization: string;
  department?: string;
  vacancy_count?: number;
  salary?: number;
  registration_deadline?: string;
  exam_date?: string;
  description?: string;
  status?: 'open' | 'closed' | 'upcoming';
  image_url?: string;
  created_at: string;
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

export interface StudentExam {
  id: string;
  student_id: string;
  exam_position_id: string;  // Updated from exam_positions_id
  status: ExamPositionStatus;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  exam_position: ExamPosition;
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
