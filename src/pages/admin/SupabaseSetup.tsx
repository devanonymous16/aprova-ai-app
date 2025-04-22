
import { useState } from 'react';
import SupabaseSetupTester from '@/components/admin/SupabaseSetupTester';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Play } from 'lucide-react';

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
  
  const [sqlResult, setSqlResult] = useState<{
    success?: boolean;
    data?: any;
    error?: any;
  }>({});
  
  const [loading, setLoading] = useState(false);

  const handleRunSql = async () => {
    if (!sql.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: sql 
      });
      
      if (error) {
        setSqlResult({
          success: false,
          error
        });
      } else {
        setSqlResult({
          success: true,
          data
        });
      }
    } catch (error) {
      setSqlResult({
        success: false,
        error
      });
    } finally {
      setLoading(false);
    }
  };

  const SUPABASE_URL = "https://supabase.aprova-ai.com";

  return (
    <div className="container py-10 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Configuração do Supabase</h1>
        <p className="text-muted-foreground">
          Esta página permite testar e configurar a conexão com o Supabase self-hosted.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status do Servidor</CardTitle>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ferramentas de SQL</CardTitle>
            <CardDescription>Execute comandos SQL no banco de dados</CardDescription>
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
                
                <Button 
                  onClick={handleRunSql}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Executando...' : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Executar SQL
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="query" className="space-y-4">
                <Textarea
                  placeholder="Digite uma consulta SQL..."
                  className="font-mono text-sm min-h-[120px]"
                  value="SELECT * FROM information_schema.tables WHERE table_schema = 'public';"
                />
                
                <Button variant="outline" className="w-full">Executar Consulta</Button>
              </TabsContent>
            </Tabs>

            {(sqlResult.data || sqlResult.error) && (
              <div className="mt-4 border rounded">
                <div className="p-2 border-b bg-muted font-medium text-sm">
                  Resultado da Execução
                </div>
                <div className="p-2">
                  {sqlResult.success ? (
                    <div className="text-green-600">Comando executado com sucesso</div>
                  ) : (
                    <div className="text-red-600">
                      Erro: {sqlResult.error?.message || 'Erro desconhecido'}
                    </div>
                  )}
                  
                  {(sqlResult.data || sqlResult.error) && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs max-h-[200px]">
                      {JSON.stringify(sqlResult.data || sqlResult.error, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
