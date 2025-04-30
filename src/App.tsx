// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Opcional: Ferramentas Dev
import { AuthProvider } from './contexts/AuthContext'; // Verifique o path
import { Toaster } from "@/components/ui/sonner"; // Verifique o path (shadcn/ui toast)

// --- IMPORTAÇÃO DO QUERY CLIENT ---
import { queryClient } from '@/lib/react-query'; // <<< Importa do novo arquivo

// Layouts
import MainLayout from './components/layout/MainLayout'; // Verifique o path
import AuthLayout from './components/layout/AuthLayout'; // Verifique o path

// Guards
import RoleGuard from './components/RoleGuard'; // Verifique o path

// Pages (Importações dinâmicas podem ser consideradas para otimização)
import HomePage from './pages/Index';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPassword';
import StudentDashboard from './pages/dashboard/student/Index'; // Assumindo que Index faz o roteamento interno
import ManagerDashboard from './pages/dashboard/manager/Index'; // Assumindo que Index faz o roteamento interno
// import AdminDashboard from './pages/dashboard/admin/Index'; // Se existir
import ExamDetailPage from './pages/student/ExamDetail'; // Exemplo de página específica
// ... outras páginas ...
import NotFoundPage from './pages/NotFound';
import UnauthorizedPage from './pages/Unauthorized';


function App() {
  // --- REMOVER a linha `const queryClient = new QueryClient()` daqui ---

  return (
    // Provedor do React Query usando o cliente importado
    <QueryClientProvider client={queryClient}>
      {/* Provedor de Autenticação */}
      <AuthProvider>
        {/* Router */}
        <Router>
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

            {/* Rotas Protegidas (Dashboard) */}
            {/* Usando MainLayout para rotas que precisam da Navbar/Sidebar pós-login */}
            <Route element={<MainLayout />}>
              {/* Rota para Estudantes */}
              <Route
                path="/dashboard/student/*" // Use /* para rotas aninhadas dentro do StudentDashboard
                element={
                  <RoleGuard allowedRoles={['student']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
               {/* Rota de Detalhe do Exame (Exemplo) - Também protegida */}
               <Route
                path="/student/exams/:examId" // Ajuste o path conforme sua estrutura
                element={
                  <RoleGuard allowedRoles={['student']}>
                    <ExamDetailPage />
                  </RoleGuard>
                }
               />

              {/* Rota para Gerentes */}
              <Route
                path="/dashboard/manager/*" // Use /* para rotas aninhadas
                element={
                  <RoleGuard allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </RoleGuard>
                }
              />

              {/* Rota para Admin (se aplicável) */}
              {/*
              <Route
                path="/dashboard/admin/*"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              */}

              {/* Adicionar outras rotas protegidas dentro do MainLayout aqui */}

            </Route> {/* Fim do MainLayout */}


            {/* Rotas de Erro/Status */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} /> {/* Rota 404 */}

          </Routes>
        </Router>

        {/* Componente para exibir Toasts */}
        <Toaster richColors position="top-right" />

      </AuthProvider>

       {/* Ferramentas de Dev do React Query (aparece apenas em desenvolvimento) */}
       <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;