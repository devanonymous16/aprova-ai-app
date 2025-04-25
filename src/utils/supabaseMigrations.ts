
import { supabase } from '@/integrations/supabase/client';
import schemaUpdatesSQL from './migrations/20250425_schema_updates.sql?raw';
import educationLevelPricesSQL from './migrations/20250425_education_level_prices.sql?raw';

export const runSchemaUpdates = async () => {
  try {
    console.log('Starting schema updates...');
    
    // Execute the schema updates migration SQL
    console.log('Running schema updates...');
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql_query: schemaUpdatesSQL
    });
    
    if (schemaError) {
      console.error('Error executing schema updates:', schemaError);
      throw schemaError;
    }
    
    // Execute the education level prices migration SQL
    console.log('Updating education level prices...');
    const { error: pricesError } = await supabase.rpc('exec_sql', {
      sql_query: educationLevelPricesSQL
    });
    
    if (pricesError) {
      console.error('Error updating education level prices:', pricesError);
      throw pricesError;
    }
    
    console.log('Schema updates completed successfully');
    return true;
  } catch (error) {
    console.error('Failed to execute schema updates:', error);
    throw error;
  }
};

