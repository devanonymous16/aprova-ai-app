
import { useState } from 'react';
import { LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { forceLogout } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UnauthorizedForceLogoutProps {
  user: any;
}

export default function UnauthorizedForceLogout({ user }: UnauthorizedForceLogoutProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleForceLogout = async () => {
    setIsLoggingOut(true);
    try {
      await forceLogout();
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

  if (!user) return null;

  return (
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
  );
}
