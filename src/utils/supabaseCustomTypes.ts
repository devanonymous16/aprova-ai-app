
import { Database as OriginalDatabase } from '@/integrations/supabase/types';

// Extended Database type that includes system tables and our custom RPC functions
export interface Database extends OriginalDatabase {
  public: {
    Tables: OriginalDatabase['public']['Tables'];
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
