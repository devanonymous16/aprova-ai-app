
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulando carregamento do usuário inicial
  useEffect(() => {
    // Aqui você implementaria a lógica de verificação de sessão
    // Por exemplo, checando cookies ou localStorage
    const checkAuth = async () => {
      try {
        // Simular verificação de autenticação
        const hasSession = localStorage.getItem('forefy-user');
        
        if (hasSession) {
          // Em uma implementação real, você buscaria dados do usuário de uma API
          const userData = JSON.parse(hasSession) as User;
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  // Funções de autenticação simuladas
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulando login
      // Em produção, isto seria uma chamada API para Supabase ou serviço auth
      
      // Simulando respostas diferentes baseadas no e-mail para demonstração
      let mockUser: User;
      
      if (email.includes('admin')) {
        mockUser = {
          id: '1',
          email,
          name: 'Administrador',
          role: 'admin',
          avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=1a365d&color=fff'
        };
      } else if (email.includes('manager')) {
        mockUser = {
          id: '2',
          email,
          name: 'Gerente',
          role: 'manager',
          organizationId: 'org-123',
          avatarUrl: 'https://ui-avatars.com/api/?name=Manager&background=2a6496&color=fff'
        };
      } else {
        mockUser = {
          id: '3',
          email,
          name: 'Estudante',
          role: 'student',
          avatarUrl: 'https://ui-avatars.com/api/?name=Student&background=4da167&color=fff',
          isB2BStudent: email.includes('b2b')
        };
      }
      
      setUser(mockUser);
      
      // Salvar no localStorage para persistir a sessão simulada
      localStorage.setItem('forefy-user', JSON.stringify(mockUser));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    // Lógica de logout
    setUser(null);
    localStorage.removeItem('forefy-user');
  };
  
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Simular registro de usuário
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: 'student',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4da167&color=fff`
      };
      
      setUser(newUser);
      localStorage.setItem('forefy-user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      hasRole,
      login,
      logout,
      signUp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
