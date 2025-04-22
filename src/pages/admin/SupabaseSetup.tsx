
import { useState } from 'react';
import SupabaseSetupTester from '@/components/admin/SupabaseSetupTester';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Play, Copy, Terminal, Server } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Define the Supabase URL constant
const SUPABASE_URL = "https://supabase.aprova-ai.com";

export default function SupabaseSetupPage() {
  const [sql, setSql] = useState(
`-- SQL para criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'manager', 'admin')),
  avatar_url TEXT,
  birth_date TEXT,
  cpf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar políticas de RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler perfis" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que usuários atualizem seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para permitir que admins atualizem qualquer perfil
CREATE POLICY "Admins podem atualizar qualquer perfil" ON public.profiles
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );`);
  
  const [sqlConsulta, setSqlConsulta] = useState(
    "SELECT * FROM information_schema.tables WHERE table_schema = 'public';"
  );
  
  const [sqlResult, setSqlResult] = useState<{
    success?: boolean;
    data?: any;
    error?: any;
  }>({});
  
  const [loading, setLoading] = useState(false);
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado para a área de transferência');
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <div className="container py-10 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Configuração do Supabase</h1>
        <p className="text-muted-foreground">
          Esta página permite testar e configurar a conexão com o Supabase self-hosted.
        </p>
      </div>

      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          As funções RPC <code>get_service_status</code> e <code>exec_sql</code> não foram encontradas no servidor Supabase.
          É necessário criar essas funções ou usar abordagens alternativas para administrar o banco de dados.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status do Servidor
            </CardTitle>
            <CardDescription>Informações sobre o servidor Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">URL:</div>
              <div className="text-sm">{SUPABASE_URL}</div>
              
              <div className="text-sm font-medium">Projeto:</div>
              <div className="text-sm">default</div>
            </div>
            
            <SupabaseSetupTester />

            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Instruções para Administradores</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Para criar as funções RPC necessárias no servidor Supabase, execute os seguintes comandos SQL:</p>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                  <pre className="whitespace-pre-wrap">
{`-- Função para status do serviço
CREATE OR REPLACE FUNCTION public.get_service_status()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'status', 'ok',
    'version', version(),
    'timestamp', now()
  );
$$;

-- Função para execução de SQL (restrita a superusuário)
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Conceder acesso às funções
GRANT EXECUTE ON FUNCTION public.get_service_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
`}</pre>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => copyToClipboard(`-- Função para status do serviço
CREATE OR REPLACE FUNCTION public.get_service_status()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'status', 'ok',
    'version', version(),
    'timestamp', now()
  );
$$;

-- Função para execução de SQL (restrita a superusuário)
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Conceder acesso às funções
GRANT EXECUTE ON FUNCTION public.get_service_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;`)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar SQL
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ferramentas de SQL</CardTitle>
            <CardDescription>SQL para criar tabelas no banco de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="create">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="create">Criar Tabelas</TabsTrigger>
                <TabsTrigger value="query">Consultar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4">
                <Textarea
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                  className="font-mono text-sm min-h-[300px]"
                />
                
                <div className="flex justify-between">
                  <Button 
                    onClick={() => copyToClipboard(sql)}
                    variant="outline"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar SQL
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Execute este SQL no Console SQL do Supabase
                  </span>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nota Importante</AlertTitle>
                  <AlertDescription>
                    Para criar as tabelas, é necessário acessar o Console SQL do Supabase e executar o SQL acima diretamente.
                    A função RPC <code>exec_sql</code> não está disponível neste servidor.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="query" className="space-y-4">
                <Textarea
                  placeholder="Digite uma consulta SQL..."
                  className="font-mono text-sm min-h-[120px]"
                  value={sqlConsulta}
                  onChange={(e) => setSqlConsulta(e.target.value)}
                />
                
                <div className="flex justify-between">
                  <Button 
                    onClick={() => copyToClipboard(sqlConsulta)}
                    variant="outline"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar SQL
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Execute este SQL no Console SQL do Supabase
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
