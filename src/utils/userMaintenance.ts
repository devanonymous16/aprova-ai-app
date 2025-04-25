
import { supabase } from '@/integrations/supabase/client';

interface TestUser {
  email: string;
  role: 'student' | 'manager' | 'admin';
  name: string;
}

const TEST_USERS: TestUser[] = [
  { email: 'student@demo.com', role: 'student', name: 'Estudante Demo' },
  { email: 'manager@demo.com', role: 'manager', name: 'Gerente Demo' },
  { email: 'admin@demo.com', role: 'admin', name: 'Admin Demo' }
];

export const cleanupTestUsers = async () => {
  try {
    console.log('Starting test users cleanup...');
    
    // 1. List all current users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }
    
    console.log(`Found ${users.length} total users`);
    
    // 2. Delete users that aren't in our test set
    const testEmails = TEST_USERS.map(u => u.email.toLowerCase());
    const usersToDelete = users.filter(u => !testEmails.includes(u.email?.toLowerCase() || ''));
    
    console.log(`Found ${usersToDelete.length} users to delete`);
    
    for (const user of usersToDelete) {
      console.log(`Deleting user: ${user.email}`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Error deleting user ${user.email}:`, deleteError);
      }
    }
    
    // 3. Ensure test users exist and are properly configured
    for (const testUser of TEST_USERS) {
      console.log(`Processing test user: ${testUser.email}`);
      
      // Check if user exists
      const existingUser = users.find(u => 
        u.email?.toLowerCase() === testUser.email.toLowerCase()
      );
      
      let userId: string;
      
      if (!existingUser) {
        console.log(`Creating user: ${testUser.email}`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: 'Teste123',
          email_confirm: true,
          user_metadata: {
            name: testUser.name
          }
        });
        
        if (createError) {
          console.error(`Error creating user ${testUser.email}:`, createError);
          continue;
        }
        
        userId = newUser.user.id;
      } else {
        userId = existingUser.id;
        
        // Ensure email is confirmed
        if (!existingUser.email_confirmed_at) {
          console.log(`Confirming email for: ${testUser.email}`);
          await supabase.auth.admin.updateUserById(userId, {
            email_confirm: true
          });
        }
      }
      
      // Ensure profile exists with correct role
      console.log(`Upserting profile for: ${testUser.email}`);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role
        }, {
          onConflict: 'id'
        });
        
      if (profileError) {
        console.error(`Error upserting profile for ${testUser.email}:`, profileError);
      }
    }
    
    // 4. Final verification
    const { data: { users: finalUsers }, error: finalListError } = await supabase.auth.admin.listUsers();
    
    if (finalListError) {
      console.error('Error in final user verification:', finalListError);
      throw finalListError;
    }
    
    const finalUserCount = finalUsers.length;
    const allTestUsersExist = TEST_USERS.every(testUser => 
      finalUsers.some(u => u.email?.toLowerCase() === testUser.email.toLowerCase())
    );
    
    console.log('Cleanup completed!');
    console.log(`Final user count: ${finalUserCount}`);
    console.log(`All test users exist: ${allTestUsersExist ? 'Yes' : 'No'}`);
    
    return {
      success: true,
      finalUserCount,
      allTestUsersExist
    };
    
  } catch (error) {
    console.error('Error in cleanupTestUsers:', error);
    throw error;
  }
};
