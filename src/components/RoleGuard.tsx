
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { Progress } from '@/components/ui/progress';

interface RoleGuardProps {
  allowedRoles: UserRole | UserRole[];
  children: ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({ 
  allowedRoles, 
  children, 
  redirectTo = '/login' 
}: RoleGuardProps) {
  const { isAuthenticated, hasRole, loading, profile, user } = useAuth();
  const location = useLocation();
  const [progressValue, setProgressValue] = useState(10);
  
  // Effect to animate the progress bar
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      setProgressValue(100);
    }
  }, [loading]);
  
  useEffect(() => {
    console.log('RoleGuard - Auth State:', {
      isAuthenticated,
      loading,
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? {
        role: profile.role,
        name: profile.name
      } : null,
      allowedRoles,
      currentPath: location.pathname
    });
    
    if (profile) {
      console.log('Verificando permissão:', {
        userRole: profile.role,
        allowedRoles,
        hasAccess: hasRole(allowedRoles)
      });
    }
  }, [isAuthenticated, loading, profile, user, hasRole, allowedRoles, location]);
  
  // Max loading time of 5 seconds before assuming there's an issue
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (loading) {
      timeoutId = window.setTimeout(() => {
        console.warn('RoleGuard loading timeout - possible auth issue');
      }, 5000);
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [loading]);
  
  // If authentication is still loading, show the loading indicator
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-white z-50">
        <div className="w-full max-w-md px-4">
          <Progress value={progressValue} className="h-2 mb-4" />
          <p className="text-center text-muted-foreground">Verificando suas permissões...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('RoleGuard: User not authenticated, redirecting to login');
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }
  
  // If the profile is not loaded
  if (!profile) {
    console.log('RoleGuard: User profile not loaded, redirecting to unauthorized page');
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If the user doesn't have the required role
  if (!hasRole(allowedRoles)) {
    console.log(`RoleGuard: User does not have required role(s): Current role=${profile.role}, Required=${Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}`);
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If everything is fine, render the children
  console.log('RoleGuard: Access granted');
  return <>{children}</>;
}
