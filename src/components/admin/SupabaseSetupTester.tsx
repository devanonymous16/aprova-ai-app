
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export default function SupabaseSetupTester() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    success?: boolean;
    message?: string;
    details?: any;
  }>({});

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      // Teste de conexão simples: verificar se conseguimos listar schemas
      const { data, error } = await supabase
        .from('pg_catalog.pg_namespace')
        .select('nspname')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          // Tentar outra abordagem mais simples
          const { data: versionData, error: versionError } = await supabase
            .rpc('version')
            .single();
            
          if (versionError) {
            // Tentar uma consulta simples às tabelas do sistema
            const { data: tablesData, error: tablesError } = await supabase
              .from('information_schema.tables')
              .select('table_name')
              .eq('table_schema', 'public')
              .limit(1);
              
            if (tablesError) {
              setStatus({
                success: false,
                message: `Erro ao conectar com o Supabase: ${tablesError.message}`,
                details: tablesError
              });
            } else {
              setStatus({
                success: true,
                message: 'Conexão bem-sucedida com o Supabase',
                details: tablesData
              });
            }
          } else {
            setStatus({
              success: true,
              message: 'Conexão bem-sucedida com o Supabase',
              details: versionData
            });
          }
        } else {
          setStatus({
            success: false,
            message: `Erro ao conectar com o Supabase: ${error.message}`,
            details: error
          });
        }
      } else {
        setStatus({
          success: true,
          message: 'Conexão bem-sucedida com o Supabase',
          details: data
        });
      }
    } catch (error: any) {
      setStatus({
        success: false,
        message: `Erro ao testar conexão: ${error.message || 'Erro desconhecido'}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfilesTable = async () => {
    setLoading(true);
    try {
      // Verificar se a tabela profiles já existe
      const { data: existingTable, error: checkError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles')
        .maybeSingle();

      if (checkError) {
        toast.error('Erro ao verificar tabela', {
          description: checkError.message
        });
        setStatus({
          success: false,
          message: `Erro ao verificar tabela: ${checkError.message}`,
          details: checkError
        });
        setLoading(false);
        return;
      }

      // Se a tabela já existe, notificar e sair
      if (existingTable?.table_name) {
        toast.success('Tabela profiles já existe');
        setStatus({
          success: true,
          message: 'Tabela profiles já existe',
          details: existingTable
        });
        setLoading(false);
        return;
      }

      // Como não podemos executar SQL diretamente via API REST,
      // orientamos o usuário a executar o SQL no Console SQL do Supabase
      setStatus({
        success: false,
        message: 'Para criar a tabela profiles, é necessário executar o SQL diretamente no Console SQL do Supabase',
        details: {
          instruction: 'Acesse o Console SQL do Supabase e execute o SQL fornecido na aba "Criar Tabelas"'
        }
      });
      toast.error('Não é possível criar tabela via API', {
        description: 'Execute o SQL diretamente no Console SQL do Supabase'
      });
    } catch (error: any) {
      setStatus({
        success: false,
        message: `Erro: ${error.message || 'Erro desconhecido'}`,
        details: error
      });
      toast.error('Erro ao criar tabela', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunSql = async () => {
    setLoading(true);
    try {
      // Verificar se a tabela profiles existe
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles')
        .maybeSingle();
      
      if (error) {
        setStatus({
          success: false,
          message: `Erro ao verificar tabela: ${error.message}`,
          details: error
        });
      } else {
        setStatus({
          success: true,
          message: data?.table_name ? 'A tabela profiles existe!' : 'A tabela profiles não existe',
          details: data
        });
      }
    } catch (error: any) {
      setStatus({
        success: false,
        message: `Erro ao verificar tabela: ${error.message || 'Erro desconhecido'}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste de Conexão Supabase
        </CardTitle>
        <CardDescription>
          Verifique se o Supabase self-hosted está configurado corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.message && (
          <Alert variant={status.success ? "default" : "destructive"}>
            {status.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{status.success ? 'Sucesso' : 'Erro'}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
            
            {status.details && (
              <div className="mt-2 text-xs">
                <details>
                  <summary className="cursor-pointer">Detalhes técnicos</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                    {JSON.stringify(status.details, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={handleTestConnection} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              'Testar Conexão'
            )}
          </Button>
          
          <Button 
            onClick={createProfilesTable} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Verificar Tabela'
            )}
          </Button>
        </div>
        
        <Button 
          onClick={handleRunSql}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          Verificar Tabela Profiles
        </Button>
      </CardFooter>
    </Card>
  );
}
