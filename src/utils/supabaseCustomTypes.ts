
import { Database as OriginalDatabase } from '@/integrations/supabase/types';

// Extended Database type that includes our custom tables
export interface Database extends OriginalDatabase {
  public: {
    Tables: OriginalDatabase['public']['Tables'] & {
      exam_positions: {
        Row: {
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
        };
        Insert: {
          id?: string;
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
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          organization?: string;
          department?: string;
          vacancy_count?: number;
          salary?: number;
          registration_deadline?: string;
          exam_date?: string;
          description?: string;
          status?: 'open' | 'closed' | 'upcoming';
          image_url?: string;
          created_at?: string;
        };
      };
      student_exams: {
        Row: {
          id: string;
          student_id: string;
          exam_position_id: string;
          status: string;
          progress_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          exam_position_id: string;
          status?: string;
          progress_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          exam_position_id?: string;
          status?: string;
          progress_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'] & {
      exec_sql: {
        Args: { sql_query: string };
        Returns: any;
      };
      get_service_status: {
        Args: Record<string, never>;
        Returns: any;
      };
    };
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
  // Adding system schema tables
  information_schema: {
    Tables: {
      tables: {
        Row: {
          table_name: string;
          table_schema: string;
          [key: string]: any;
        };
      };
    };
  };
  pg_catalog: {
    Tables: {
      pg_namespace: {
        Row: {
          nspname: string;
          [key: string]: any;
        };
      };
    };
  };
}

// Create a customized supabase client type with our extended Database type
export type CustomSupabaseClient = ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;
