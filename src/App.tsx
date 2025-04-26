import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import RoleGuard from "./components/RoleGuard";
import { useState, useEffect } from "react";

// Pages
import HomePage from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Signup";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import DashboardPage from "./pages/dashboard/Index";
import AdminDashboard from "./pages/dashboard/admin/Index";
import ManagerDashboard from "./pages/dashboard/manager/Index";
import StudentDashboard from "./pages/dashboard/student/Index";
import UnauthorizedPage from "./pages/Unauthorized";
import SupabaseSetupPage from "./pages/admin/SupabaseSetup";

// Student Pages
import StudentExams from "./pages/student/Exams";
import StudentExamDetail from "./pages/student/ExamDetail";
import StudentAutoDiagnosis from "./pages/student/AutoDiagnosis";
import StudentStudyPlan from "./pages/student/StudyPlan";
import StudentSolveQuestion from "./pages/student/SolveQuestion";
import StudentSimulado from "./pages/student/Simulado";
import StudentProfile from "./pages/student/Profile";

function App() {
  console.log('[DIAGNÓSTICO] App.tsx: Componente App renderizando...');
  
  const [queryClient] = useState(() => {
    console.log('[DIAGNÓSTICO] App.tsx: Criando QueryClient');
    return new QueryClient();
  });
  
  useEffect(() => {
    console.log('[DIAGNÓSTICO] App.tsx: useEffect montagem do App executando');
    return () => {
      console.log('[DIAGNÓSTICO] App.tsx: useEffect desmontagem do App executando');
    };
  }, []);
  
  console.log('[DIAGNÓSTICO] App.tsx: Iniciando renderização do App com QueryClientProvider');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <MainLayout>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/admin/supabase-setup" element={<SupabaseSetupPage />} />
              <Route path="/teste" element={<TestComponent />} />
              
              {/* Rotas protegidas comentadas temporariamente para diagnóstico */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Simple test component for routing diagnosis
const TestComponent = () => {
  console.log('[DIAGNÓSTICO] App.tsx: TestComponent renderizando');
  return <div className="p-8 text-center">Teste OK - Roteamento funcionando</div>;
};

export default App;
