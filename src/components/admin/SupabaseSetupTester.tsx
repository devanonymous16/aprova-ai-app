
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import { testSupabaseConnection, setupProfilesTable } from '@/utils/supabaseSetup';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

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
      const result = await testSupabaseConnection();
      setStatus(result);
    } catch (error: any) {
      setStatus({
        success: false,
        message: `Erro inesperado: ${error.message || 'Desconhecido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTables = async () => {
    setLoading(true);
    try {
      const success = await setupProfilesTable();
      
      if (success) {
        setStatus({
          success: true,
          message: 'Tabela de perfis criada com sucesso'
        });
      } else {
        setStatus({
          success: false,
          message: 'Falha ao criar tabela de perfis'
        });
      }
    } catch (error: any) {
      setStatus({
        success: false,
        message: `Erro ao criar tabelas: ${error.message || 'Desconhecido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunSql = async () => {
    setLoading(true);
    const sql = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
      );
    `;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        setStatus({
          success: false,
          message: `Erro ao executar SQL: ${error.message}`,
          details: error
        });
      } else {
        setStatus({
          success: true,
          message: 'SQL executado com sucesso',
          details: data
        });
      }
    } catch (error: any) {
      setStatus({
        success: false,
        message: `Erro ao executar SQL: ${error.message || 'Desconhecido'}`,
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
            onClick={handleSetupTables} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Tabelas'
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
