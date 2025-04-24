
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SupabaseSetupTester from '@/components/admin/SupabaseSetupTester';
import { testSupabaseConnection } from '@/utils/supabaseSetup';
import { setupProfilesTable, checkAuthAndProfile } from '@/utils/supabaseSetup';
import { toast } from '@/components/ui/sonner';
import { RefreshCw, CheckCircle2 } from 'lucide-react';  // Adicionado as importações dos ícones

export default function SupabaseSetupPage() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  const [isSettingUpTables, setIsSettingUpTables] = useState(false);
  const [tablesStatus, setTablesStatus] = useState<boolean | null>(null);
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    success: boolean;
    message: string;
    user?: any;
    profile?: any;
  } | null>(null);
  
  useEffect(() => {
    document.title = 'Aprova.ai | Configuração do Supabase';
  }, []);
  
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus(result);
      
      if (result.success) {
        toast.success('Conexão bem sucedida com Supabase');
      } else {
        toast.error('Falha na conexão com Supabase', {
          description: result.message
        });
      }
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus({
        success: false,
        message: `Erro: ${error.message || 'Desconhecido'}`
      });
      
      toast.error('Erro ao testar conexão');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSetupTables = async () => {
    setIsSettingUpTables(true);
    try {
      const result = await setupProfilesTable();
      setTablesStatus(result);
      
      if (result) {
        toast.success('Tabelas configuradas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao configurar tabelas:', error);
      setTablesStatus(false);
    } finally {
      setIsSettingUpTables(false);
    }
  };
  
  const handleCheckAuth = async () => {
    setIsCheckingAuth(true);
    try {
      const result = await checkAuthAndProfile();
      setAuthStatus(result);
      
      if (result.success) {
        toast.success('Usuário autenticado com perfil completo');
      } else if (result.user) {
        toast.warning('Usuário autenticado, mas sem perfil completo');
      } else {
        toast.error('Nenhum usuário autenticado');
      }
    } catch (error: any) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthStatus({
        success: false,
        message: `Erro: ${error.message || 'Desconhecido'}`
      });
    } finally {
      setIsCheckingAuth(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Configuração do Supabase</h1>
      
      <Tabs defaultValue="tester">
        <TabsList className="mb-6">
          <TabsTrigger value="tester">Tester</TabsTrigger>
          <TabsTrigger value="manual">Setup Manual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tester">
          <SupabaseSetupTester />
        </TabsContent>
        
        <TabsContent value="manual">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Testar Conexão</CardTitle>
                <CardDescription>
                  Verifique se a conexão com o Supabase está funcionando corretamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectionStatus && (
                  <div className={`p-4 rounded-md mb-4 ${
                    connectionStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={connectionStatus.success ? 'text-green-800' : 'text-red-800'}>
                      {connectionStatus.message}
                    </p>
                    
                    {connectionStatus.details && (
                      <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-auto">
                        {JSON.stringify(connectionStatus.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isTestingConnection}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      {connectionStatus?.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Testar Conexão
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Verificar/Criar Tabelas</CardTitle>
                <CardDescription>
                  Verifica se as tabelas necessárias existem no Supabase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Este processo verifica se a tabela de perfis existe no seu banco de dados Supabase.
                </p>
                
                {tablesStatus !== null && (
                  <div className={`p-4 rounded-md ${
                    tablesStatus ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={tablesStatus ? 'text-green-800' : 'text-red-800'}>
                      {tablesStatus 
                        ? 'Tabelas verificadas com sucesso' 
                        : 'Erro ao verificar tabelas. Veja o console para mais detalhes.'}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSetupTables} 
                  disabled={isSettingUpTables || !connectionStatus?.success}
                  variant="outline"
                >
                  {isSettingUpTables ? 'Verificando...' : 'Verificar Tabelas'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Verificar Autenticação</CardTitle>
                <CardDescription>
                  Verifica se há um usuário autenticado e seu perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                {authStatus !== null && (
                  <div className={`p-4 rounded-md ${
                    authStatus.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className={authStatus.success ? 'text-green-800' : 'text-yellow-800'}>
                      {authStatus.message}
                    </p>
                    
                    {authStatus.user && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <p><strong>User ID:</strong> {authStatus.user.id}</p>
                        <p><strong>Email:</strong> {authStatus.user.email}</p>
                      </div>
                    )}
                    
                    {authStatus.profile && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <p><strong>Nome:</strong> {authStatus.profile.name}</p>
                        <p><strong>Role:</strong> {authStatus.profile.role}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCheckAuth} 
                  disabled={isCheckingAuth || !connectionStatus?.success}
                  variant="outline"
                >
                  {isCheckingAuth ? 'Verificando...' : 'Verificar Autenticação'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
