
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const { profile, loading, user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Logging to debug authentication state
    console.log('Dashboard Page - Auth State:', { 
      loading, 
      user: user ? { id: user.id, email: user.email } : null, 
      profile,
      hasProfile: !!profile,
      currentPath: location.pathname
    });
    
    // If we have a profile that has been loaded, show a welcome toast
    if (profile && !loading) {
      toast.success(`Bem-vindo, ${profile.name}!`, {
        description: `Você está logado como ${profile.role}`
      });
    } else if (!loading && user && !profile) {
      console.log('Profile not found in DashboardPage, but user exists');
      toast.warning('Carregando seu perfil de usuário', {
        description: 'Por favor, aguarde enquanto configuramos seu acesso'
      });
    }
  }, [profile, user, loading, location.pathname]);
  
  // If still loading, show a more informative loading indicator with progress
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-white z-50">
        <div className="w-full max-w-md px-4">
          <Progress value={50} className="h-2 mb-4" />
          <p className="text-center text-muted-foreground">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }
  
  // If the user is not authenticated, redirect to login
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If the profile is not found but we're done loading, redirect to unauthorized
  if (!profile && !loading) {
    console.log('Profile not found, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If we have a profile, redirect to the role-specific dashboard
  if (profile) {
    switch (profile.role) {
      case 'admin':
        console.log('Redirecting to admin dashboard');
        return <Navigate to="/dashboard/admin" replace />;
      case 'manager':
        console.log('Redirecting to manager dashboard');
        return <Navigate to="/dashboard/manager" replace />;
      case 'student':
        console.log('Redirecting to student dashboard');
        return <Navigate to="/dashboard/student" replace />;
      default:
        // Unexpected role
        console.warn('Unexpected role:', profile.role);
        return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // This should never be reached, but providing a fallback UI just in case
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-heading">
          Redirecionando...
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Por favor, aguarde enquanto processamos seu acesso.
        </p>
      </div>
    </div>
  );
}
