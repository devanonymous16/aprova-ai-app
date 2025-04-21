
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Este componente é um roteador inteligente que direciona o usuário
// para a dashboard específica com base em seu papel
export default function DashboardPage() {
  const { profile, loading } = useAuth();
  
  useEffect(() => {
    // Exemplo de logging para ajudar a depurar
    if (profile) {
      console.log(`User role: ${profile.role}`);
    }
  }, [profile]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div>
      </div>
    );
  }
  
  if (!profile) {
    return <Navigate to="/login" />;
  }
  
  // Redireciona para a dashboard específica do papel do usuário
  switch (profile.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" />;
    case 'manager':
      return <Navigate to="/dashboard/manager" />;
    case 'student':
      return <Navigate to="/dashboard/student" />;
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
