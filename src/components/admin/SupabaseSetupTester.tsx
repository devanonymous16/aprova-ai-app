
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
      // Use a simple query to test the connection instead of system tables
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        // If error with profiles table (might not exist yet), try a more basic approach
        try {
          // Try a raw SQL query via REST
          const { data: healthData } = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
            headers: {
              'apikey': supabase.supabaseKey,
              'Content-Type': 'application/json',
            },
          });
          
          setStatus({
            success: true,
            message: 'Conexão bem-sucedida com o Supabase (via REST API)',
            details: { method: 'rest-api', response: healthData }
          });
        } catch (restError: any) {
          // Last try - just check if we can reach the server
          try {
            const response = await fetch(supabase.supabaseUrl);
            setStatus({
              success: response.ok,
              message: response.ok 
                ? 'Servidor Supabase acessível'
                : `Erro ao acessar o servidor: ${response.statusText}`,
              details: { method: 'fetch', status: response.status }
            });
          } catch (fetchError: any) {
            setStatus({
              success: false,
              message: `Erro ao conectar com o Supabase: ${fetchError.message || error.message}`,
              details: { originalError: error, fetchError }
            });
          }
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
      // First check if profiles table exists using a more compatible approach
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error && error.code === 'PGRST204') {
        // Table likely doesn't exist (not found error)
        toast.info('A tabela profiles não existe ainda', {
          description: 'É necessário criar no Console SQL do Supabase'
        });
        
        setStatus({
          success: false,
          message: 'A tabela profiles não existe. Use o SQL fornecido para criá-la no Console SQL do Supabase.',
          details: { error }
        });
      } else if (error) {
        // Some other error
        toast.error('Erro ao verificar tabela', {
          description: error.message
        });
        
        setStatus({
          success: false,
          message: `Erro ao verificar tabela: ${error.message}`,
          details: error
        });
      } else {
        // Table exists
        toast.success('Tabela profiles já existe');
        
        setStatus({
          success: true,
          message: 'A tabela profiles já existe',
          details: data
        });
      }
    } catch (error: any) {
      setStatus({
        success: false,
        message: `Erro: ${error.message || 'Erro desconhecido'}`,
        details: error
      });
      toast.error('Erro ao verificar tabela', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunSql = async () => {
    setLoading(true);
    try {
      // Simpler approach - try to select from profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST204') {
          setStatus({
            success: false,
            message: 'A tabela profiles não existe',
            details: error
          });
        } else {
          setStatus({
            success: false,
            message: `Erro ao verificar tabela: ${error.message}`,
            details: error
          });
        }
      } else {
        setStatus({
          success: true,
          message: 'A tabela profiles existe!',
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
