// supabase/functions/add-invite-student/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Importa o Supabase client
import { corsHeaders } from '../_shared/cors.ts'; // Assumindo que você terá um arquivo _shared/cors.ts

console.log('Function add-invite-student initializing...');

// --- Definição de Tipos (pode mover para um arquivo _shared/types.ts) ---
interface RequestPayload {
  cpf: string;
  email: string;
  name: string;
}

interface Profile {
  id: string;
  email?: string | null;
  // Adicione outros campos do perfil se necessário
}

interface OrganizationUser {
  user_id: string;
  organization_id: string;
  role: string; // 'student', 'manager', etc.
}

// --- Início da Função Principal ---
serve(async (req: Request) => {
  console.log('add-invite-student function invoked.');

  // Lida com requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Criar Cliente Supabase com Service Role (para operações de admin) ---
    // As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
    // são automaticamente injetadas no ambiente da Edge Function pelo Supabase.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } } // Passa o auth do usuário chamador
    );

    // --- 2. Obter o ID do Manager e sua Organization ID ---
    // O JWT do manager que chamou a função está em req.headers.get('Authorization')
    // O Supabase Edge Runtime valida o token e o `supabaseAdmin` acima pode usar
    // o contexto de usuário se a RLS permitir, ou funções auth.
    const { data: { user: managerUser }, error: userError } = await supabaseAdmin.auth.getUser();

    if (userError || !managerUser) {
      console.error('Error getting manager user:', userError);
      return new Response(JSON.stringify({ error: 'Manager não autenticado ou não encontrado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    console.log('Manager autenticado:', managerUser.id, managerUser.email);

    // Busca a organização do manager
    // TODO: Esta query depende do auth.uid() funcionar dentro da RLS ou da função,
    // ou precisamos de uma forma mais direta de obter a org do manager logado.
    // Por enquanto, vamos assumir que o manager SÓ tem UMA organização para simplificar,
    // e que a RLS em organization_users permitirá que o service_role leia isso se necessário.
    // Alternativamente, o frontend poderia enviar a organization_id se o manager puder ter várias.
    const { data: managerOrgData, error: managerOrgError } = await supabaseAdmin
      .from('organization_users')
      .select('organization_id')
      .eq('user_id', managerUser.id)
      // .eq('role', 'manager') // Se o role manager estiver em organization_users
      .limit(1)
      .maybeSingle();

    if (managerOrgError || !managerOrgData?.organization_id) {
      console.error('Error fetching manager organization or manager not in org:', managerOrgError);
      return new Response(JSON.stringify({ error: 'Organização do manager não encontrada ou manager não associado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }
    const organizationId = managerOrgData.organization_id;
    console.log('Manager pertence à organização:', organizationId);


    // --- 3. Obter Dados da Requisição ---
    const payload: RequestPayload = await req.json();
    const { cpf, email, name } = payload;

    if (!cpf || !email || !name) {
      return new Response(JSON.stringify({ error: 'CPF, email e nome são obrigatórios.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    // Limpa CPF (remove não dígitos)
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length !== 11) {
        return new Response(JSON.stringify({ error: 'CPF inválido. Deve conter 11 dígitos.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
    console.log('Payload recebido:', { cpf: cleanedCpf, email, name });


    // --- 4. Buscar Perfil por CPF ---
    console.log('Buscando perfil por CPF:', cleanedCpf);
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email') // Seleciona apenas o necessário
      .eq('cpf', cleanedCpf)
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error('Erro ao buscar perfil por CPF:', profileError);
      throw profileError; // Joga para o catch principal
    }

    // --- 5. Lógica de Adição ou Convite ---
    if (existingProfile) {
      // --- 5a. CPF ENCONTRADO (Aluno Existente) ---
      console.log('Aluno existente encontrado com CPF:', cleanedCpf, 'ID:', existingProfile.id);

      // Verificar se já está associado a ESTA organização
      const { data: existingAssociation, error: assocError } = await supabaseAdmin
        .from('organization_users')
        .select('*')
        .eq('user_id', existingProfile.id)
        .eq('organization_id', organizationId)
        .limit(1)
        .maybeSingle();

      if (assocError) {
        console.error('Erro ao verificar associação existente:', assocError);
        throw assocError;
      }

      if (existingAssociation) {
        console.log('Aluno já associado a esta organização.');
        return new Response(JSON.stringify({ message: `Aluno ${name} (${email}) já está associado a esta organização.` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Ou 409 (Conflict) se preferir
        });
      } else {
        console.log('Associando aluno existente à organização...');
        const { error: insertAssocError } = await supabaseAdmin
          .from('organization_users')
          .insert({ user_id: existingProfile.id, organization_id: organizationId, role: 'student' });

        if (insertAssocError) {
          console.error('Erro ao inserir associação para aluno existente:', insertAssocError);
          throw insertAssocError;
        }
        // TODO: Atualizar email no profiles se o email fornecido for diferente do existingProfile.email?
        // E se o email fornecido já estiver em uso por OUTRO usuário?
        // Por simplicidade, não atualizaremos o email do perfil existente por enquanto.

        console.log('Aluno existente associado com sucesso.');
        return new Response(JSON.stringify({ message: `Aluno ${name} (${email}) adicionado à organização com sucesso.` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

    } else {
      // --- 5b. CPF NÃO ENCONTRADO (Novo Aluno) ---
      console.log('CPF não encontrado. Procedendo para convidar novo aluno...');

      // Verificar se o email já está em uso em auth.users
      // Nota: inviteUserByEmail faz essa verificação, mas podemos fazer antes para uma mensagem melhor.
      // Por simplicidade, deixaremos o inviteUserByEmail lidar com isso.

      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          data: { // Estes dados vão para user_metadata no auth.users
            initial_name: name,
            cpf_to_set: cleanedCpf, // Usar um nome diferente para evitar conflito com coluna 'cpf'
            invited_to_org_id: organizationId,
            invited_by_manager_id: managerUser.id
          },
          // redirectTo: 'URL_DA_SUA_APP_PARA_DEFINIR_SENHA' // Opcional
        }
      );

      if (inviteError) {
        console.error('Erro ao convidar usuário:', inviteError);
        // Tratar erros comuns do inviteUserByEmail
        if (inviteError.message.includes('User already registered')) {
             return new Response(JSON.stringify({ error: `O email ${email} já está registrado. Se este é o aluno correto, adicione-o usando o CPF dele.` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 409, // Conflict
            });
        }
        throw inviteError;
      }

      console.log('Convite enviado com sucesso para:', email, 'Data do convite:', inviteData);
      // O trigger no banco de dados (a ser criado) cuidará de criar o profile e associar à org.
      return new Response(JSON.stringify({ message: `Convite enviado com sucesso para ${name} (${email}).` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error: any) {
    console.error('Erro geral na função add-invite-student:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500,
    });
  }
});