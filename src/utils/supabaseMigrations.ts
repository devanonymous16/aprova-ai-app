
import { supabase } from '@/integrations/supabase/client';
import migrationSQL from './migrations/20250425_schema_updates.sql?raw';

export const runSchemaUpdates = async () => {
  try {
    console.log('Starting schema updates...');
    
    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (error) {
      console.error('Error executing schema updates:', error);
      throw error;
    }
    
    console.log('Schema updates completed successfully');
    return true;
  } catch (error) {
    console.error('Failed to execute schema updates:', error);
    throw error;
  }
};
