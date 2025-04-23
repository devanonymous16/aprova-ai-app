
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export default function DashboardPage() {
  const { profile, loading, user } = useAuth();
  
  useEffect(() => {
    // Logging to debug authentication state
    console.log('Dashboard Page - Auth State:', { 
      loading, 
      user: user ? { id: user.id, email: user.email } : null, 
      profile,
      hasProfile: !!profile
    });
    
    if (profile) {
      console.log(`User role detected: ${profile.role}`);
    } else if (!loading && user) {
      console.log('Profile not found in DashboardPage, but user exists');
      toast.warning('Carregando seu perfil de usuário', {
        description: 'Por favor, aguarde enquanto configuramos seu acesso'
      });
    }
  }, [profile, user, loading]);
  
  // If still loading, show a more informative loading indicator
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900 mb-4"></div>
        <p className="text-center text-muted-foreground">Carregando seu perfil...</p>
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
