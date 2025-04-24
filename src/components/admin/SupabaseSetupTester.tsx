
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, RefreshCw, Database, Code, Server } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase, testSupabaseConnection } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';

// Define the Supabase URL and key constants
const SUPABASE_URL = "https://supabase.aprova-ai.com";
const SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ";

interface TestResult {
  success?: boolean;
  message?: string;
  details?: any;
  timestamp?: Date;
}

export default function SupabaseSetupTester() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TestResult>({});
  const [profileStatus, setProfileStatus] = useState<TestResult>({});

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      console.log('Iniciando teste de conexão com Supabase...');
      const result = await testSupabaseConnection();
      
      console.log('Resultado do teste:', result);
      setStatus({
        ...result,
        timestamp: new Date()
      });
      
      if (result.success) {
        toast.success('Conexão com Supabase estabelecida', {
          description: result.message
        });
      } else {
        toast.error('Falha na conexão com Supabase', {
          description: result.message
        });
      }
    } catch (error: any) {
      console.error('Erro durante teste de conexão:', error);
      setStatus({
        success: false,
        message: `Erro durante teste: ${error.message || 'Erro desconhecido'}`,
        details: error,
        timestamp: new Date()
      });
      toast.error('Falha no teste de conexão', {
        description: error.message || 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkProfilesTable = async () => {
    setLoading(true);
    try {
      // Verificar se tabela profiles existe
      console.log('Verificando tabela profiles...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .limit(5);
        
      console.log('Resultado da verificação:', { data, error });
      
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setProfileStatus({
            success: false,
            message: 'A tabela profiles não existe. É necessário criar a tabela.',
            details: error,
            timestamp: new Date()
          });
          
          toast.warning('Tabela profiles não encontrada', {
            description: 'É necessário criar a tabela no Supabase'
          });
        } else {
          setProfileStatus({
            success: false,
            message: `Erro ao verificar tabela: ${error.message}`,
            details: error,
            timestamp: new Date()
          });
          
          toast.error('Erro ao verificar tabela profiles', {
            description: error.message
          });
        }
      } else {
        setProfileStatus({
          success: true,
          message: `Tabela profiles existe. ${data.length} registro(s) encontrado(s).`,
          details: data,
          timestamp: new Date()
        });
        
        toast.success('Tabela profiles verificada', {
          description: `${data.length} registro(s) encontrado(s)`
        });
      }
    } catch (error: any) {
      console.error('Erro ao verificar tabela profiles:', error);
      setProfileStatus({
        success: false,
        message: `Erro: ${error.message || 'Erro desconhecido'}`,
        details: error,
        timestamp: new Date()
      });
      
      toast.error('Erro ao verificar tabela', {
        description: error.message || 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const getAuthStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        toast.error('Erro ao verificar sessão', {
          description: error.message
        });
        return;
      }
      
      if (data.session) {
        toast.success('Sessão autenticada', {
          description: `Usuário: ${data.session.user.email}`
        });
      } else {
        toast.info('Sem sessão ativa', {
          description: 'Não há usuário autenticado'
        });
      }
    } catch (error: any) {
      toast.error('Erro ao verificar sessão', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Teste de Conexão
          </CardTitle>
          <Badge variant={status.success ? "success" : status.success === false ? "destructive" : "outline"}>
            {status.success ? "Conectado" : status.success === false ? "Falha" : "Não Testado"}
          </Badge>
        </div>
        <CardDescription>
          Verificação da conexão com o Supabase
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
            
            {status.timestamp && (
              <div className="mt-1 text-xs text-gray-500">
                {new Date(status.timestamp).toLocaleString()}
              </div>
            )}
            
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

        {profileStatus.message && (
          <Alert variant={profileStatus.success ? "default" : "destructive"}>
            {profileStatus.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{profileStatus.success ? 'Tabela Profiles' : 'Erro'}</AlertTitle>
            <AlertDescription>{profileStatus.message}</AlertDescription>
            
            {profileStatus.details && (
              <div className="mt-2 text-xs">
                <details>
                  <summary className="cursor-pointer">Detalhes</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                    {JSON.stringify(profileStatus.details, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </Alert>
        )}
        
        <div className="flex flex-col gap-2 text-sm bg-gray-50 rounded-md p-3">
          <div className="grid grid-cols-2">
            <span className="font-medium">URL Supabase:</span>
            <span className="font-mono text-xs">{SUPABASE_URL}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-medium">Projeto:</span>
            <span>default</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="font-medium">Chave:</span>
            <span className="font-mono text-xs truncate" title={SUPABASE_ANON_KEY}>
              {SUPABASE_ANON_KEY.substring(0, 20)}...
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={handleTestConnection} 
            disabled={loading}
            className="w-full"
            variant="default"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Server className="mr-2 h-4 w-4" />
                Testar Conexão
              </>
            )}
          </Button>
          
          <Button 
            onClick={checkProfilesTable} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Verificar Tabela
              </>
            )}
          </Button>
        </div>
        
        <Button 
          onClick={getAuthStatus}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          <Code className="mr-2 h-4 w-4" />
          Verificar Sessão Auth
        </Button>
      </CardFooter>
    </Card>
  );
}
