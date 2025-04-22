import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldX, RefreshCw } from 'lucide-react';
import CreateProfileDialog from '@/components/auth/CreateProfileDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export default function UnauthorizedPage() {
  const { profile, logout, user, session, hasRole } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [supabaseInfo, setSupabaseInfo] = useState<any>(null);
  
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count()');
        if (error) {
          setSupabaseInfo({ error: error.message, status: 'error' });
        } else {
          setSupabaseInfo({ 
            connected: true, 
            data: data,
            url: supabase.supabaseUrl,
            status: 'success'
          });
        }
      } catch (err: any) {
        setSupabaseInfo({ error: err.message, status: 'exception' });
      }
    };
    
    checkSupabaseConnection();
  }, []);
  
  const handleProfileCreated = () => {
    window.location.href = '/dashboard';
  };
  
  const handleCheckProfile = async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        toast.error(`Erro ao verificar perfil: ${error.message}`);
      } else if (data) {
        toast.success(`Perfil encontrado: ${data.name} (${data.role})`);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        toast.warning("Perfil não encontrado. Tente criá-lo manualmente.");
      }
    } catch (err: any) {
      toast.error(`Erro ao verificar: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  const renderDebugInfo = () => {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left text-sm max-w-xl mx-auto">
        <h3 className="font-semibold mb-2">Informações de depuração:</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Autenticado:</span> {user ? 'Sim' : 'Não'}</p>
          <p><span className="font-medium">E-mail:</span> {user?.email || 'N/A'}</p>
          <p><span className="font-medium">ID de usuário:</span> {user?.id || 'N/A'}</p>
          <p><span className="font-medium">Perfil carregado:</span> {profile ? 'Sim' : 'Não'}</p>
          {profile && (
            <>
              <p><span className="font-medium">Nome:</span> {profile.name}</p>
              <p><span className="font-medium">Role:</span> {profile.role}</p>
              <p><span className="font-medium">Admin:</span> {hasRole('admin') ? 'Sim' : 'Não'}</p>
            </>
          )}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium mb-1">Status do Supabase:</p>
            {supabaseInfo ? (
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(supabaseInfo, null, 2)}
              </pre>
            ) : (
              <p>Verificando conexão...</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-red-50 p-4 rounded-full mb-6">
        <ShieldX className="h-16 w-16 text-red-600" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-gray-900 font-heading mb-2">
        Acesso não autorizado
      </h1>
      
      <p className="text-center text-lg text-gray-600 mb-8 max-w-md">
        Você não tem permissão para acessar esta página. 
        {profile ? ` Seu perfil atual é: ${profile.role}.` : ' Seu perfil não foi carregado corretamente.'}
      </p>
      
      {!profile && user && (
        <div className="mb-8 space-y-4">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setDialogOpen(true)}
          >
            Criar perfil manualmente
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCheckProfile}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Verificar perfil no Supabase
              </>
            )}
          </Button>
          
          {user && (
            <CreateProfileDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              userId={user.id}
              email={user.email || ''}
              onComplete={handleProfileCreated}
            />
          )}
        </div>
      )}
      
      {renderDebugInfo()}
      
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <Link to="/">
          <Button>
            Voltar para a página inicial
          </Button>
        </Link>
        
        <Link to="/dashboard">
          <Button variant="outline">
            Ir para o dashboard
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          onClick={async () => {
            await logout();
            window.location.href = '/login';
          }}
        >
          Sair e entrar com outra conta
        </Button>
      </div>
    </div>
  );
}
