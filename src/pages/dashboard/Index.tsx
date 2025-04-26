
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export default function DashboardPage() {
  const { profile, loading, user } = useAuth();
  
  useEffect(() => {
    if (profile) {
      console.log(`Papel do usuário: ${profile.role}`);
    } else if (!loading && user) {
      toast.warning('Perfil de usuário não encontrado', {
        description: 'Você será redirecionado para criar seu perfil'
      });
    }
  }, [profile, user, loading]);
  
  // Se ainda estiver carregando, mostre o indicador de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div>
      </div>
    );
  }
  
  // Se o usuário não estiver autenticado, redirecione para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se o perfil não for encontrado, redirecione para a página não autorizada
  if (!profile) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Redireciona para a dashboard específica do papel do usuário
  switch (profile.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'manager':
      return <Navigate to="/dashboard/manager" replace />;
    case 'student':
      return <Navigate to="/dashboard/student" replace />;
    default:
      // Fallback se algo der errado com as roles
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-heading">
              Bem-vindo ao Forefy!
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Estamos redirecionando você para sua área...
            </p>
          </div>
        </div>
      );
  }
}
