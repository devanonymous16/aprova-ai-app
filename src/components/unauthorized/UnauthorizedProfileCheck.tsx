
import { useState } from 'react';
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UnauthorizedProfileCheckProps {
  user: any;
  profile: any;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

export default function UnauthorizedProfileCheck({
  user,
  profile,
  dialogOpen,
  setDialogOpen
}: UnauthorizedProfileCheckProps) {
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

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

  if (!user || profile) return null;

  return (
    <div className="mb-8 space-y-4">
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
    </div>
  );
}
