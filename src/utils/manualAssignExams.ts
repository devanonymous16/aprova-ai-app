import { supabase } from '@/integrations/supabase/client';

export const manualAssignExamsToUser = async (userEmail: string) => {
  try {
    console.log('[MANUAL ASSIGN] Iniciando para:', userEmail);
    
    // Buscar o usuário pelo email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (profileError || !profile) {
      console.error('[MANUAL ASSIGN] Usuário não encontrado:', profileError);
      return false;
    }
    
    const userId = profile.id;
    console.log('[MANUAL ASSIGN] ID do usuário:', userId);
    
    // Verificar se já tem concursos
    const { data: existingExams } = await supabase
      .from('student_exams')
      .select('id')
      .eq('student_id', userId)
      .limit(1);
    
    if (existingExams && existingExams.length > 0) {
      console.log('[MANUAL ASSIGN] Usuário já tem concursos!');
      return true;
    }
    
    // Criar os concursos
    const studentExamsData = [
      {
        student_id: userId,
        exam_id: '826688ef-6e53-4b7a-8d0d-94a549eb7021',
        exam_position_id: 'df3467c5-62c0-4d6f-9840-57a26775c120',
        access_type: 'paid',
        is_current_focus: true,
        status: 'Em andamento'
      },
      {
        student_id: userId,
        exam_id: '67aa377e-b94f-4ff4-a3ac-5a84a59ed222',
        exam_position_id: 'b353b9c4-ef05-4b76-a494-ad56332f66d5',
        access_type: 'paid',
        is_current_focus: false,
        status: 'Em andamento'
      },
      {
        student_id: userId,
        exam_id: '26f8285e-56fd-4299-8334-cf18c3c76835',
        exam_position_id: '78e8dd9c-dceb-4d32-bfc2-32735fe5b3bf',
        access_type: 'paid',
        is_current_focus: false,
        status: 'Em andamento'
      }
    ];
    
    console.log('[MANUAL ASSIGN] Inserindo:', studentExamsData);
    
    const { error: insertError } = await supabase
      .from('student_exams')
      .insert(studentExamsData);
    
    if (insertError) {
      console.error('[MANUAL ASSIGN] Erro ao inserir:', insertError);
      return false;
    }
    
    console.log('[MANUAL ASSIGN] Sucesso!');
    return true;
    
  } catch (error) {
    console.error('[MANUAL ASSIGN] Erro:', error);
    return false;
  }
};

// Função para usar no console do navegador
(window as any).assignExamsToUser = manualAssignExamsToUser;

