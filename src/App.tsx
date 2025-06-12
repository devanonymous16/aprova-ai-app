// src/App.tsx
import { Routes, Route, Outlet } from 'react-router-dom'; // <<< ADICIONADO Outlet
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { StudentFocusProvider } from './contexts/StudentFocusContext';
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from '@/lib/react-query';
import { useAuthNavigation } from './hooks/useAuthNavigation';
import AdminDashboardPage from './pages/dashboard/admin/Index'; // << ADICIONE ESTA LINHA


// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Guards
import RoleGuard from './components/RoleGuard';

// Pages
import HomePage from './pages/Index';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPassword';

// Páginas do Dashboard do Estudante
import StudentDashboardPage from './pages/dashboard/student/Index'; // Renomeado para clareza (página principal)
import PracticePage from './pages/student/PracticePage';      // <<<< IMPORTAR PracticePage
import ExamDetailPage from './pages/student/ExamDetail';
// import StudentSettingsPage from './pages/student/SettingsPage'; // Exemplo de outra página

// Páginas do Manager
import ManagerDashboard from './pages/dashboard/manager/Index';
import StudentManagePage from './pages/dashboard/manager/StudentManagePage';

import NotFoundPage from './pages/NotFound';
import UnauthorizedPage from './pages/Unauthorized';


// Um componente de layout simples para as rotas do estudante, se MainLayout não for suficiente
// Ou você pode colocar o RoleGuard diretamente em cada rota filha.
// Por agora, vamos assumir que MainLayout já tem o <Outlet/> e RoleGuard protege o conjunto.
// Se StudentDashboard (Index.tsx) fosse um layout com menu lateral, ele teria o <Outlet/>.
// Como não é, MainLayout é o layout pai.

function AppContent() {
  useAuthNavigation(); 

  return (
    <>
      <Routes>
         {/* Rotas Públicas */}
         <Route path="/" element={<HomePage />} />

         {/* Rotas de Autenticação */}
         <Route element={<AuthLayout />}>
           <Route path="/login" element={<LoginPage />} />
           <Route path="/signup" element={<SignupPage />} />
           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
           <Route path="/reset-password" element={<ResetPasswordPage />} />
         </Route>

         {/* Rotas Protegidas (Dentro do MainLayout) */}
         <Route element={<MainLayout />}> {/* MainLayout DEVE ter <Outlet /> */}
            
            {/* Rotas do Estudante - ANINHADAS */}
            <Route path="/dashboard/student"> {/* Rota pai para o dashboard do estudante */}
              <Route 
                index // Rota padrão para /dashboard/student
                element={ 
                  <RoleGuard allowedRoles={['student']}>
                    <StudentDashboardPage /> 
                  </RoleGuard>
                } 
              />
              <Route 
                path="practice" // Rota para /dashboard/student/practice
                element={
                  <RoleGuard allowedRoles={['student']}>
                    <PracticePage />
                  </RoleGuard>
                } 
              />
              {/* Adicione outras sub-rotas do estudante aqui, ex:
              <Route 
                path="settings"
                element={
                  <RoleGuard allowedRoles={['student']}>
                    <StudentSettingsPage />
                  </RoleGuard>
                }
              /> 
              */}
            </Route>
            {/* Rota para detalhes do exame do estudante (fora do aninhamento /dashboard/student se a URL for diferente) */}
            <Route 
              path="/student/exams/:examId" 
              element={ 
                <RoleGuard allowedRoles={['student']}>
                  <ExamDetailPage />
                </RoleGuard>
              } 
            />

            {/* Rotas do Gerente */}
            {/* Similarmente, se ManagerDashboard tiver sub-rotas, aninhe-as */}
            <Route path="/dashboard/manager">
                <Route 
                    index
                    element={ 
                        <RoleGuard allowedRoles={['manager']}>
                            <ManagerDashboard />
                        </RoleGuard>
                    } 
                />
                <Route
                    path="students/:studentId/manage" 
                    element={
                        <RoleGuard allowedRoles={['manager']}> 
                        <StudentManagePage />                 
                        </RoleGuard>
                    }
                />
                {/* Outras sub-rotas do manager aqui */}
            </Route>
            {/* Rotas do Admin */}
            <Route path="/dashboard/admin" // Ou /admin/dashboard se preferir
                    element={
                        <RoleGuard allowedRoles={['admin']}> {/* Garante que só admin acesse */}
                            <AdminDashboardPage />
                        </RoleGuard>
                    }
                />
                {/* Se houver sub-rotas para o admin, aninhe-as aqui como fizemos para student */}
                {/* <Route path="/dashboard/admin/*" element={ <RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard> } /> */}
            </Route>

         {/* Rotas de Erro */}
         <Route path="/unauthorized" element={<UnauthorizedPage />} />
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StudentFocusProvider>
          <AppContent />
        </StudentFocusProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;