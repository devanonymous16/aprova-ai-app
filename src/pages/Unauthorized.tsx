
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import UnauthorizedHeader from '@/components/unauthorized/UnauthorizedHeader';
import UnauthorizedDebugInfo from '@/components/unauthorized/UnauthorizedDebugInfo';
import UnauthorizedActions from '@/components/unauthorized/UnauthorizedActions';
import UnauthorizedConnectionStatus from '@/components/unauthorized/UnauthorizedConnectionStatus';
import UnauthorizedForceLogout from '@/components/unauthorized/UnauthorizedForceLogout';
import UnauthorizedProfileCheck from '@/components/unauthorized/UnauthorizedProfileCheck';

export default function UnauthorizedPage() {
  const { profile, user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
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
            url: "https://supabase.aprova-ai.com",
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

  const handleProfileCreated = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <UnauthorizedHeader profile={profile} />
      
      <UnauthorizedConnectionStatus 
        supabaseInfo={supabaseInfo}
        setSupabaseInfo={setSupabaseInfo}
      />
      
      <UnauthorizedForceLogout user={user} />
      
      <UnauthorizedProfileCheck
        user={user}
        profile={profile}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
      />
      
      <UnauthorizedActions
        profile={profile}
        user={user}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        handleCheckProfile={async () => {}} // Empty because handling is moved to UnauthorizedProfileCheck
        isChecking={false}
        logout={async () => {}} // Empty because we're using force logout
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
