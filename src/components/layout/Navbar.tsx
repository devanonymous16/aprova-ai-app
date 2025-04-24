import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X,
  Book,
  User,
  Users,
  Settings,
  LogIn,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, logout, isAuthenticated } = useAuth();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('[DIAGNÓSTICO LOGOUT] Botão Sair clicado');
    
    try {
      document.body.style.cursor = 'wait';
      console.log('[DIAGNÓSTICO LOGOUT] Chamando função logout...');
      
      setTimeout(async () => {
        try {
          await logout();
          console.log('[DIAGNÓSTICO LOGOUT] Função logout foi concluída');
        } catch (error) {
          console.error('[DIAGNÓSTICO LOGOUT] Erro capturado no handleLogout:', error);
          window.location.href = '/login';
        } finally {
          document.body.style.cursor = 'default';
        }
      }, 0);
    } catch (error) {
      console.error('[DIAGNÓSTICO LOGOUT] Erro no handler de logout:', error);
      document.body.style.cursor = 'default';
    }
    
    return false;
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const getRoleColor = () => {
    if (!profile) return 'bg-gray-400';
    
    switch (profile.role) {
      case 'admin':
        return 'bg-primary-900';
      case 'manager':
        return 'bg-secondary-500';
      case 'student':
        return 'bg-success-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  const getRoleIcon = () => {
    if (!profile) return <User />;
    
    switch (profile.role) {
      case 'admin':
        return <Settings className="h-4 w-4" />;
      case 'manager':
        return <Users className="h-4 w-4" />;
      case 'student':
        return <Book className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-heading font-bold text-gradient">
                Forefy
              </h1>
            </Link>
            <div className="hidden md:ml-10 md:flex space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 flex items-center h-full border-b-2 font-medium text-sm"
              >
                Home
              </Link>
              <Link
                to="/features"
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 flex items-center h-full border-b-2 font-medium text-sm"
              >
                Recursos
              </Link>
              <Link
                to="/pricing"
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 flex items-center h-full border-b-2 font-medium text-sm"
              >
                Planos
              </Link>
              <Link
                to="/about"
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 flex items-center h-full border-b-2 font-medium text-sm"
              >
                Sobre
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center">
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 ml-2">
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className={getRoleColor()}>
                          {profile?.name ? getInitials(profile.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{profile?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex items-center gap-2">
                        {getRoleIcon()}
                        <span className="capitalize">{profile?.role}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/profile" className="flex items-center gap-2 w-full">
                        <User className="h-4 w-4" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/settings" className="flex items-center gap-2 w-full">
                        <Settings className="h-4 w-4" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      handleLogout(e as unknown as React.MouseEvent<HTMLElement>);
                    }}>
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Sair
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="default" className="bg-primary-900 hover:bg-primary-800">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex md:hidden">
            <Button variant="ghost" className="ml-2" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-4 space-y-1">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              to="/features"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-900"
            >
              Recursos
            </Link>
            <Link
              to="/pricing"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-900"
            >
              Planos
            </Link>
            <Link
              to="/about"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-900"
            >
              Sobre
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-900"
                >
                  Perfil
                </Link>
                <button
                  onClick={(e) => handleLogout(e)}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-900"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-900"
                >
                  Entrar
                </Link>
                <Link
                  to="/signup"
                  className="block pl-3 pr-4 py-2 border-l-4 border-primary-500 text-base font-medium text-primary-700 bg-primary-50"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
