
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

import UnauthorizedHeader from '@/components/unauthorized/UnauthorizedHeader';
import UnauthorizedActions from '@/components/unauthorized/UnauthorizedActions';
import UnauthorizedDebugInfo from '@/components/unauthorized/UnauthorizedDebugInfo';

const SUPABASE_URL = "https://supabase.aprova-ai.com";

export default function UnauthorizedPage() {
  const { profile, logout, user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [supabaseInfo, setSupabaseInfo] = useState<any>(null);

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
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          setSupabaseInfo({ error: error.message, status: 'error' });
        } else {
          setSupabaseInfo({
            connected: true,
            data: data,
            url: SUPABASE_URL,
            status: 'success'
          });
        }
      } catch (err: any) {
        setSupabaseInfo({ error: err.message, status: 'exception' });
      }
    };

    checkSupabaseConnection();
  }, [profile, navigate]);

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
          navigate('/dashboard');
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

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <UnauthorizedHeader profile={profile} />
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
