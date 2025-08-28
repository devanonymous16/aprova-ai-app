import { supabase } from '@/integrations/supabase/client';

export const autoAssignDefaultExams = async (userId: string) => {
  try {
    console.log('[AUTO EXAMS] Iniciando atribuição automática de concursos para:', userId);
    
    // Verificar se o usuário já tem concursos
    const { data: existingExams, error: checkError } = await supabase
      .from('student_exams')
      .select('id')
      .eq('student_id', userId)
      .limit(1);
    
    if (checkError) {
      console.error('[AUTO EXAMS] Erro ao verificar concursos existentes:', checkError);
      return false;
    }
    
    if (existingExams && existingExams.length > 0) {
      console.log('[AUTO EXAMS] Usuário já tem concursos, pulando...');
      return true;
    }
    
    // Copiar concursos exatos do student@demo.com
    console.log('[AUTO EXAMS] Copiando concursos do student@demo.com...');
    
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
      },
      {
        student_id: userId,
        exam_id: '4806517c-6523-4b72-9d38-9022c82730cc',
        exam_position_id: 'c814186c-16ff-4aba-9f36-99e88042b789',
        access_type: 'paid',
        is_current_focus: false,
        status: 'Em andamento'
      },
      {
        student_id: userId,
        exam_id: 'caf3db4b-a060-4c94-a102-5bbfdbc9cb18',
        exam_position_id: '82ae91d3-c3da-4304-8f25-e60130af1d09',
        access_type: 'paid',
        is_current_focus: false,
        status: 'Em andamento'
      },
      {
        student_id: userId,
        exam_id: '56404734-386a-4dae-8ecc-eadd4a14bb23',
        exam_position_id: 'c2665b64-5eb2-412d-8743-1481715edc9b',
        access_type: 'paid',
        is_current_focus: false,
        status: 'Em andamento'
      }
    ];
    
    console.log('[AUTO EXAMS] Dados a serem inseridos (copiados do demo):', studentExamsData);
    
    const { error: insertError } = await supabase
      .from('student_exams')
      .insert(studentExamsData);
    
    if (insertError) {
      console.error('[AUTO EXAMS] Erro ao criar concursos:', insertError);
      return false;
    }
    
    console.log('[AUTO EXAMS] Concursos criados com sucesso!', studentExamsData.length);
    return true;
    
  } catch (error) {
    console.error('[AUTO EXAMS] Erro crítico:', error);
    return false;
  }
};
