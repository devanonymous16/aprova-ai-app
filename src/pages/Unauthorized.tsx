import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, checkSupabaseConnection, reconnectToSupabase, forceLogout, clearSupabaseCache } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { UserRole } from '@/types/user';

import UnauthorizedHeader from '@/components/unauthorized/UnauthorizedHeader';
import UnauthorizedActions from '@/components/unauthorized/UnauthorizedActions';
import UnauthorizedDebugInfo from '@/components/unauthorized/UnauthorizedDebugInfo';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff, LogOut } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const SUPABASE_URL = "https://supabase.aprova-ai.com";

export default function UnauthorizedPage() {
  const { profile, logout, user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [supabaseInfo, setSupabaseInfo] = useState<any>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  useEffect(() => {
    if (profile) {
      const redirectToDashboard = () => {
        if (profile.role === 'admin') {
          navigate('/dashboard/admin');
        } else if (profile.role === 'manager') {
          navigate('/dashboard/manager');
        } else if (profile.role === 'student') {
          navigate('/dashboard/student');
        }
      };
      redirectToDashboard();
    }

    const checkSupabaseConnection = async () => {
      try {
        console.log('Verificando conexão com Supabase...');
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          console.error('Erro na conexão com Supabase:', error);
          setSupabaseInfo({ error: error.message, status: 'error' });
        } else {
          console.log('Conexão com Supabase bem-sucedida!');
          setSupabaseInfo({
            connected: true,
            data: data,
            url: SUPABASE_URL,
            status: 'success'
          });
        }
      } catch (err: any) {
        console.error('Exceção ao conectar com Supabase:', err.message);
        setSupabaseInfo({ error: err.message, status: 'exception' });
      }
    };

    checkSupabaseConnection();
  }, [profile, navigate]);

  const handleCheckProfile = async () => {
    if (!user) return;

    setIsChecking(true);
    try {
      console.log('Verificando perfil para usuário:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar perfil:', error);
        toast.error(`Erro ao verificar perfil: ${error.message}`);
      } else if (data) {
        console.log('Perfil encontrado:', data);
        toast.success(`Perfil encontrado: ${data.name} (${data.role})`);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        console.log('Perfil não encontrado');
        toast.warning("Perfil não encontrado. Tente criá-lo manualmente.");
      }
    } catch (err: any) {
      console.error('Exceção ao verificar perfil:', err);
      toast.error(`Erro ao verificar: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleForceLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Usa a função de logout forçado
      await forceLogout();
      
      // Redireciona para a página de login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao forçar logout:', error);
      toast.error('Erro ao fazer logout forçado', {
        description: 'Tente recarregar a página'
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const success = await reconnectToSupabase();
      
      if (success) {
        // Atualiza o estado da página com as novas informações de conexão
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        if (!error) {
          setSupabaseInfo({
            connected: true,
            data: data,
            url: SUPABASE_URL,
            status: 'success',
            reconnected: true
          });
          
          // Se o usuário estiver logado, tenta recarregar o perfil
          if (user) {
            handleCheckProfile();
          }
        }
      }
    } catch (error) {
      console.error('Erro ao tentar reconectar:', error);
    } finally {
      setIsReconnecting(false);
    }
  };
  
  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearSupabaseCache();
      toast.success('Cache limpo com sucesso', {
        description: 'Tente reconectar ao Supabase agora'
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache', {
        description: 'Tente recarregar a página'
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <UnauthorizedHeader profile={profile} />
      
      {/* Adiciona alerta de conexão */}
      {supabaseInfo?.status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-red-600">
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">Problema de conexão com o servidor</span>
          </div>
          <p className="text-sm text-center text-gray-600">
            Não foi possível estabelecer conexão com o Supabase. 
            Isso pode ser por uma instabilidade temporária.
          </p>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            <Button 
              variant="outline" 
              onClick={handleReconnect} 
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reconectando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar reconectar
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClearCache}
              disabled={isClearingCache}
            >
              {isClearingCache ? 'Limpando...' : 'Limpar cache'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Botão de força logout */}
      {user && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center gap-3">
          <p className="text-sm text-center text-gray-600">
            Se você está enfrentando problemas para deslogar ou com sua sessão, 
            tente forçar o logout para limpar completamente a sessão.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="mt-2"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Forçar logout
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso irá desconectar sua conta e limpar todos os dados de sessão.
                  Você precisará fazer login novamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleForceLogout}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      <UnauthorizedActions
        profile={profile}
        user={user}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        handleCheckProfile={handleCheckProfile}
        isChecking={isChecking}
        logout={logout}
        handleProfileCreated={handleProfileCreated}
      />
      <UnauthorizedDebugInfo
        user={user}
        profile={profile}
        hasRole={hasRole}
        supabaseInfo={supabaseInfo}
      />
    </div>
  );
}
