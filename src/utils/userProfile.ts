
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserProfile = async (userId: string, userEmail?: string | null) => {
  console.log('[PROFILE DEBUG] fetchUserProfile iniciando:', {
    timestamp: new Date().toISOString(),
    userId,
    email: userEmail || 'não fornecido'
  });
  
  try {
    console.log('[PROFILE DEBUG] Iniciando query profiles simplificada...');
    
    // Debug logs for Supabase client
    console.log('[fetchUserProfile] Objeto supabase ANTES da query:', supabase);
    console.log('[fetchUserProfile] Tipo do supabase.from:', typeof supabase.from);
    
    // Separate query building steps for debugging
    console.log('[fetchUserProfile] Construindo query base: supabase.from(profiles)');
    const queryBuilder = supabase.from('profiles');

    console.log('[fetchUserProfile] Adicionando select(id)');
    const selectQuery = queryBuilder.select('id'); // Query simplificada ainda

    console.log('[fetchUserProfile] Adicionando eq(id, userId):', userId);
    const filteredQuery = selectQuery.eq('id', userId);

    console.log('[fetchUserProfile] Adicionando maybeSingle()');
    const finalQuery = filteredQuery.maybeSingle();

    console.log('[fetchUserProfile] EXECUTANDO a query final (await)...');
    const { data, error } = await finalQuery; // Executa aqui
    
    console.log('[fetchUserProfile] Resultado OBTIDO da query:', { data, error }); // Log CRÍTICO
    
    if (error) {
      console.error('[PROFILE DEBUG] Erro na query:', {
        timestamp: new Date().toISOString(),
        errorDetails: {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      });
      
      // If query failed and we have an email, try to create profile
      if (userEmail) {
        console.log('[PROFILE DEBUG] Tentando criar perfil após erro na query');
        return await createDefaultProfile(userId, userEmail);
      }
      return null;
    }

    // If no data found but we have email, create profile
    if (!data && userEmail) {
      console.log('[PROFILE DEBUG] Perfil não encontrado, tentando criar');
      return await createDefaultProfile(userId, userEmail);
    }

    if (!data) {
      console.log('[PROFILE DEBUG] Perfil não encontrado e sem email para criar');
      return null;
    }

    console.log('[PROFILE DEBUG] Perfil encontrado com sucesso:', {
      timestamp: new Date().toISOString(),
      profile: { id: data.id }
    });
    
    return data;
    
  } catch (error: any) {
    console.error('[PROFILE DEBUG] Erro crítico em fetchUserProfile:', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });
    console.log('[fetchUserProfile] Bloco FINALLY - Chamando setLoading(false)');
    return null;
  }
};

export const createDefaultProfile = async (userId: string, email: string) => {
  const startTime = new Date();
  console.log('[PROFILE DEBUG] Iniciando criação de perfil padrão:', {
    timestamp: startTime.toISOString(),
    userId,
    email
  });
  
  let defaultRole: UserRole = "student";
  if (email.includes('admin')) defaultRole = "admin";
  else if (email.includes('manager')) defaultRole = "manager";
  
  try {
    console.log('[PROFILE DEBUG] Inserindo perfil com role:', defaultRole, {
      timestamp: new Date().toISOString()
    });
    
    const profileData = {
      id: userId,
      email,
      name: email.split('@')[0],
      role: defaultRole
    };
    
    const createStart = new Date();
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select('role, name, avatar_url')
      .single();
    const createEnd = new Date();
      
    console.log('[PROFILE DEBUG] Tentativa de criação concluída:', {
      timestamp: createEnd.toISOString(),
      duration: createEnd.getTime() - createStart.getTime() + 'ms',
      success: !error,
      hasData: !!data
    });
      
    if (error) {
      console.error('[PROFILE DEBUG] Erro ao criar perfil padrão:', {
        timestamp: new Date().toISOString(),
        error: {
          code: error.code,
          message: error.message
        }
      });
      return null;
    }
    
    const endTime = new Date();
    console.log('[PROFILE DEBUG] Perfil padrão criado com sucesso:', {
      timestamp: endTime.toISOString(),
      totalDuration: endTime.getTime() - startTime.getTime() + 'ms',
      data
    });
    return data;
  } catch (error) {
    console.error('[PROFILE DEBUG] Erro crítico em createDefaultProfile:', {
      timestamp: new Date().toISOString(),
      error
    });
    return null;
  }
};
