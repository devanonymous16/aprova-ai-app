
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Este componente é um roteador inteligente que direciona o usuário
// para a dashboard específica com base em seu papel
export default function DashboardPage() {
  const { profile, loading, user } = useAuth();
  
  useEffect(() => {
    // Exemplo de logging para ajudar a depurar
    if (profile) {
      console.log(`Papel do usuário: ${profile.role}`);
    } else {
      console.log('Perfil não encontrado no DashboardPage', { user });
    }
  }, [profile, user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!profile) {
    console.log('Perfil não encontrado, redirecionando para unauthorized');
    return <Navigate to="/unauthorized" />;
  }
  
  // Redireciona para a dashboard específica do papel do usuário
  switch (profile.role) {
    case 'admin':
      console.log('Redirecionando para dashboard de admin');
      return <Navigate to="/dashboard/admin" />;
    case 'manager':
      console.log('Redirecionando para dashboard de manager');
      return <Navigate to="/dashboard/manager" />;
    case 'student':
      console.log('Redirecionando para dashboard de student');
      return <Navigate to="/dashboard/student" />;
    default:
      // Fallback se algo der errado com as roles
      console.log('Role não reconhecida:', profile.role);
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-heading">
              Bem-vindo ao Forefy!
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Estamos redirecionando você para sua área...
            </p>
            <pre className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto">
              {JSON.stringify({ profile, user: user ? { id: user.id, email: user.email } : null }, null, 2)}
            </pre>
          </div>
        </div>
      );
  }
}
