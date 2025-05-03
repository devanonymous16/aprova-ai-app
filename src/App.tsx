// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from '@/lib/react-query';
import { useAuthNavigation } from './hooks/useAuthNavigation'; // <<-- IMPORTAR O HOOK

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
import StudentDashboard from './pages/dashboard/student/Index';
import ManagerDashboard from './pages/dashboard/manager/Index';
// import AdminDashboard from './pages/dashboard/admin/Index';
import ExamDetailPage from './pages/student/ExamDetail';
// ... outras páginas ...
import NotFoundPage from './pages/NotFound';
import UnauthorizedPage from './pages/Unauthorized';

function App() {
  // --- CHAMAR O HOOK DE NAVEGAÇÃO AQUI ---
  useAuthNavigation(); // <<-- ESTA LINHA EXECUTA O useEffect do hook

  return (
    // QueryClientProvider e AuthProvider continuam aqui
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* As Rotas continuam aqui */}
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

            {/* Rotas Protegidas */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard/student/*" element={ <RoleGuard allowedRoles={['student']}><StudentDashboard /></RoleGuard> } />
              <Route path="/student/exams/:examId" element={ <RoleGuard allowedRoles={['student']}><ExamDetailPage /></RoleGuard> } />
              <Route path="/dashboard/manager/*" element={ <RoleGuard allowedRoles={['manager']}><ManagerDashboard /></RoleGuard> } />
              {/* <Route path="/dashboard/admin/*" element={ <RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard> } /> */}
            </Route>

            {/* Rotas de Erro */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;