
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase, testSupabaseConnection } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckIcon, AlertTriangleIcon, XIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function SupabaseSetupTester() {
  const [connectionStatus, setConnectionStatus] = useState<TestStatus>('idle');
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tableStatus, setTableStatus] = useState<TestStatus>('idle');
  const [tableDetails, setTableDetails] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<TestStatus>('idle');
  const [authDetails, setAuthDetails] = useState<any>(null);
  
  const checkConnection = async () => {
    try {
      setConnectionStatus('loading');
      setConnectionError(null);
      
      console.log('Testando conexão com Supabase...');
      const result = await testSupabaseConnection();
      console.log('Resultado do teste:', result);
      
      if (result.success) {
        setConnectionStatus('success');
        setConnectionDetails(result);
      } else {
        setConnectionStatus('error');
        setConnectionError(result.message || 'Erro desconhecido');
        setConnectionDetails(result);
      }
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus('error');
      setConnectionError(error.message || 'Erro desconhecido');
      setConnectionDetails(null);
    }
  };
  
  const checkTables = async () => {
    try {
      setTableStatus('loading');
      
      // Verifica se as tabelas necessárias existem
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['profiles', 'config', 'users']);
      
      if (error) {
        console.error('Erro ao verificar tabelas:', error);
        setTableStatus('error');
        setTableDetails({ error });
        return;
      }
      
      const tables = data || [];
      const tableNames = tables.map((t: any) => t.table_name);
      
      setTableStatus('success');
      setTableDetails({
        tables: tableNames,
        missingTables: ['profiles', 'config', 'users'].filter(
          t => !tableNames.includes(t)
        )
      });
    } catch (error: any) {
      console.error('Erro ao verificar tabelas:', error);
      setTableStatus('error');
      setTableDetails({ error: error.message });
    }
  };
  
  const checkAuth = async () => {
    try {
      setAuthStatus('loading');
      
      // Verifica se a autenticação está configurada
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro na autenticação:', error);
        setAuthStatus('error');
        setAuthDetails({ error });
        return;
      }
      
      setAuthStatus('success');
      setAuthDetails({
        session: data.session,
        hasSession: !!data.session
      });
    } catch (error: any) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthStatus('error');
      setAuthDetails({ error: error.message });
    }
  };
  
  useEffect(() => {
    // Executa automaticamente o teste de conexão quando o componente é montado
    checkConnection();
  }, []);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Conexão com Supabase</CardTitle>
            {connectionStatus === 'idle' && <Badge variant="outline">Aguardando</Badge>}
            {connectionStatus === 'loading' && <Badge variant="outline">Testando...</Badge>}
            {connectionStatus === 'success' && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Conectado</Badge>}
            {connectionStatus === 'error' && <Badge variant="destructive">Falha</Badge>}
          </div>
          <CardDescription>
            Teste a conexão com sua instância do Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-800">
              <p className="font-medium">Erro de conexão</p>
              <p className="text-sm mt-1">{connectionError}</p>
              {connectionDetails?.details && (
                <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto">
                  {JSON.stringify(connectionDetails.details, null, 2)}
                </pre>
              )}
            </div>
          )}
          
          {connectionStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-md text-green-800">
              <p className="font-medium">Conexão estabelecida</p>
              <p className="text-sm mt-1">{connectionDetails?.message}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>URL do Supabase</span>
              <code className="px-2 py-1 bg-gray-100 rounded text-xs">{process.env.SUPABASE_URL || 'https://supabase.aprova-ai.com'}</code>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={checkConnection} disabled={connectionStatus === 'loading'}>
            {connectionStatus === 'loading' ? 'Testando...' : 'Testar conexão'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tabelas do banco de dados</CardTitle>
            {tableStatus === 'idle' && <Badge variant="outline">Não verificado</Badge>}
            {tableStatus === 'loading' && <Badge variant="outline">Verificando...</Badge>}
            {tableStatus === 'success' && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Verificado</Badge>}
            {tableStatus === 'error' && <Badge variant="destructive">Erro</Badge>}
          </div>
          <CardDescription>
            Verifique se as tabelas necessárias existem no banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableDetails?.tables && (
            <div>
              <p className="text-sm mb-2">Tabelas encontradas:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {tableDetails.tables.map((table: string) => (
                  <Badge key={table} variant="secondary">{table}</Badge>
                ))}
              </div>
              
              {tableDetails.missingTables && tableDetails.missingTables.length > 0 && (
                <>
                  <p className="text-sm mb-2 text-amber-600">Tabelas necessárias não encontradas:</p>
                  <div className="flex flex-wrap gap-2">
                    {tableDetails.missingTables.map((table: string) => (
                      <Badge key={table} variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">{table}</Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          {tableStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800">
              <p className="font-medium">Erro ao verificar tabelas</p>
              <p className="text-sm mt-1">{tableDetails?.error?.message || JSON.stringify(tableDetails?.error)}</p>
            </div>
          )}
          
          {tableStatus === 'idle' && (
            <p className="text-sm text-gray-500">Clique no botão para verificar as tabelas</p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={checkTables} disabled={tableStatus === 'loading' || connectionStatus !== 'success'}>
            {tableStatus === 'loading' ? 'Verificando...' : 'Verificar tabelas'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Autenticação</CardTitle>
            {authStatus === 'idle' && <Badge variant="outline">Não verificado</Badge>}
            {authStatus === 'loading' && <Badge variant="outline">Verificando...</Badge>}
            {authStatus === 'success' && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Configurado</Badge>}
            {authStatus === 'error' && <Badge variant="destructive">Erro</Badge>}
          </div>
          <CardDescription>
            Verifique se a autenticação está configurada corretamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authStatus === 'success' && (
            <div className="p-3 bg-green-50 border border-green-100 rounded-md text-green-800">
              <p className="font-medium">Autenticação configurada</p>
              <p className="text-sm mt-1">
                {authDetails?.hasSession 
                  ? 'Sessão ativa encontrada' 
                  : 'Supabase Auth está configurado, mas não há sessão ativa'}
              </p>
              
              {authDetails?.hasSession && (
                <div className="mt-2">
                  <Separator className="my-2" />
                  <p className="text-sm font-medium">Detalhes da sessão:</p>
                  <div className="text-xs mt-1">
                    <p>Usuário: <span className="font-mono">{authDetails?.session?.user?.email || 'N/A'}</span></p>
                    <p>ID: <span className="font-mono">{authDetails?.session?.user?.id || 'N/A'}</span></p>
                    <p>Expira em: <span className="font-mono">{authDetails?.session?.expires_at 
                      ? new Date(authDetails?.session?.expires_at * 1000).toLocaleString() 
                      : 'N/A'}</span></p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {authStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800">
              <p className="font-medium">Erro na autenticação</p>
              <p className="text-sm mt-1">{authDetails?.error?.message || JSON.stringify(authDetails?.error)}</p>
            </div>
          )}
          
          {authStatus === 'idle' && (
            <p className="text-sm text-gray-500">Clique no botão para verificar a autenticação</p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={checkAuth} disabled={authStatus === 'loading' || connectionStatus !== 'success'}>
            {authStatus === 'loading' ? 'Verificando...' : 'Verificar autenticação'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
