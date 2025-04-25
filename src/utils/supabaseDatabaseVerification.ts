
import { supabase } from '@/integrations/supabase/client';

export const verifyDatabaseChanges = async () => {
  try {
    console.log('Starting database verification...');

    // 1. Verify column rename in student_exams
    const columnRenameQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'student_exams' AND column_name IN ('exam_positions_id', 'exam_position_id');
    `;
    const { data: columnData, error: columnError } = await supabase.rpc('exec_sql', { sql_query: columnRenameQuery });
    if (columnError) throw columnError;
    console.log('Column Rename Check:', columnData);

    // 2. Verify plans table removal
    const plansTableQuery = `
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'plans'
      ) AS plans_table_exists;
    `;
    const { data: plansTableData, error: plansTableError } = await supabase.rpc('exec_sql', { sql_query: plansTableQuery });
    if (plansTableError) throw plansTableError;
    console.log('Plans Table Check:', plansTableData);

    // 3. Verify exam_level_of_educations data
    const educationLevelsQuery = `
      SELECT name, promo_price, full_price 
      FROM exam_level_of_educations 
      ORDER BY name;
    `;
    const { data: educationLevelsData, error: educationLevelsError } = await supabase.rpc('exec_sql', { sql_query: educationLevelsQuery });
    if (educationLevelsError) throw educationLevelsError;
    console.log('Education Levels:', educationLevelsData);

    // 4. Verify users
    const usersQuery = `
      SELECT email, email_confirmed_at 
      FROM auth.users;
    `;
    const profilesQuery = `
      SELECT id, email, role 
      FROM profiles;
    `;
    const { data: usersData, error: usersError } = await supabase.rpc('exec_sql', { sql_query: usersQuery });
    const { data: profilesData, error: profilesError } = await supabase.rpc('exec_sql', { sql_query: profilesQuery });
    
    if (usersError) throw usersError;
    if (profilesError) throw profilesError;
    
    console.log('Users:', usersData);
    console.log('Profiles:', profilesData);

    return {
      columnRename: columnData,
      plansTableExists: plansTableData[0]?.plans_table_exists,
      educationLevels: educationLevelsData,
      users: usersData,
      profiles: profilesData
    };
  } catch (error) {
    console.error('Database verification failed:', error);
    throw error;
  }
};
