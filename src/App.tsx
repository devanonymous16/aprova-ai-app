
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import RoleGuard from "./components/RoleGuard";

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
import { useState } from "react";

// Student Pages
import StudentExams from "./pages/student/Exams";
import StudentExamDetail from "./pages/student/ExamDetail";
import StudentAutoDiagnosis from "./pages/student/AutoDiagnosis";
import StudentStudyPlan from "./pages/student/StudyPlan";
import StudentSolveQuestion from "./pages/student/SolveQuestion";
import StudentSimulado from "./pages/student/Simulado";
import StudentProfile from "./pages/student/Profile";

function App() {
  const [queryClient] = useState(() => new QueryClient());
  
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
              
              {/* Rotas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <RoleGuard allowedRoles={["student", "manager", "admin"]}>
                    <DashboardPage />
                  </RoleGuard>
                } 
              />
              
              {/* Rotas específicas de perfil */}
              <Route 
                path="/dashboard/admin" 
                element={
                  <RoleGuard allowedRoles="admin">
                    <AdminDashboard />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/dashboard/manager" 
                element={
                  <RoleGuard allowedRoles="manager">
                    <ManagerDashboard />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/dashboard/student" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentDashboard />
                  </RoleGuard>
                } 
              />
              
              {/* Rotas específicas para o fluxo do estudante */}
              <Route 
                path="/student/dashboard" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentDashboard />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/student/exams" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentExams />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/student/exams/:id" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentExamDetail />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/student/autodiagnosis/:examPositionId" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentAutoDiagnosis />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/student/study-plan" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentStudyPlan />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/student/solve/:subtopicId" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentSolveQuestion />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/student/simulado/:simuladoId" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentSimulado />
                  </RoleGuard>
                } 
              />
              
              <Route 
                path="/student/profile" 
                element={
                  <RoleGuard allowedRoles="student">
                    <StudentProfile />
                  </RoleGuard>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
