
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CreateProfileDialog from "@/components/auth/CreateProfileDialog";
import { RefreshCw } from "lucide-react";

interface UnauthorizedActionsProps {
  profile: any;
  user: any;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  handleCheckProfile: () => Promise<void>;
  isChecking: boolean;
  logout: () => Promise<void>;
  handleProfileCreated: () => void;
}

export default function UnauthorizedActions({
  profile,
  user,
  dialogOpen,
  setDialogOpen,
  handleCheckProfile,
  isChecking,
  logout,
  handleProfileCreated,
}: UnauthorizedActionsProps) {
  return (
    <>
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
    </>
  );
}
