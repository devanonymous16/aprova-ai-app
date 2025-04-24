
import { supabase } from '@/integrations/supabase/client';

export const repairUserProfiles = async () => {
  try {
    console.log('Verificando usuários sem perfil...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Erro ao listar usuários:', authError);
      return false;
    }
    
    if (!authData?.users?.length) {
      console.log('Nenhum usuário encontrado');
      return true;
    }
    
    for (const user of authData.users) {
      if (!user.email) {
        console.log(`Usuário ${user.id} não tem email, pulando...`);
        continue;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error(`Erro ao verificar perfil do usuário ${user.email}:`, error);
        continue;
      }
      
      if (!data) {
        console.log(`Usuário ${user.email} não tem perfil, criando...`);
        
        let role: 'student' | 'manager' | 'admin' = 'student';
        if (user.email?.includes('admin')) role = 'admin';
        else if (user.email?.includes('manager')) role = 'manager';
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.email?.split('@')[0] || 'Usuário',
            role: role
          });
          
        if (insertError) {
          console.error(`Erro ao criar perfil para ${user.email}:`, insertError);
        } else {
          console.log(`Perfil criado com sucesso para ${user.email}`);
        }
      } else {
        console.log(`Usuário ${user.email} já tem perfil`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao reparar perfis:', error);
    return false;
  }
};
