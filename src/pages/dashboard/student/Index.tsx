// src/pages/dashboard/student/Index.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para navegação
import { useAuth } from '@/contexts/AuthContext';
import { useStudentFocus } from '@/contexts/StudentFocusContext'; // NOSSO NOVO HOOK
import { fetchOverallProgress, fetchStudentMetrics } from '@/services/mockStudentData'; // Mantenha se ainda usar, mas o progresso deve ser por cargo
// import { useStudentExams } from '@/hooks/useStudentExams'; // Será substituído por linkedPositions
// import { useRecommendedExams } from '@/hooks/useRecommendedExams'; // Mantenha se a lógica de recomendados for separada
import DashboardHeader from '@/components/student/dashboard/DashboardHeader';
import ProgressOverview from '@/components/student/dashboard/ProgressOverview';
// import ExamsSection from '@/components/student/dashboard/ExamsSection'; // Vamos reestruturar esta parte
import TopicPerformanceChart from '@/components/student/TopicPerformanceChart';
import { Button } from '@/components/ui/button'; // Para os botões "Continuar estudando"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Para o seletor de foco
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'; // Para os cards de "Meus Concursos"
import { toast } from '@/components/ui/sonner';

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const { 
    linkedPositions, 
    currentActiveExamPositionId, 
    currentStudentExamId, 
    isLoadingFocus, 
    setCurrentFocus,
    fetchLinkedPositions // Exposto pelo contexto se precisar recarregar manualmente
  } = useStudentFocus();
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(""); // Para Concursos Recomendados, se mantiver
  
  // Mocks de progresso e métricas - DEVEM ser atualizados para usar currentActiveExamPositionId
  const [overallProgress, setOverallProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    questionsResolved: 0,
    practiceDays: { current: 0, total: 0 },
    performance: 0,
    ranking: { position: 0, total: 0 },
    practiceTime: { hours: 0, minutes: 0 }
  });
  const [loadingDashboardData, setLoadingDashboardData] = useState(true); // Renomeado para clareza

  useEffect(() => {
    document.title = 'Forefy | Dashboard do Estudante';
  }, []);

  // Efeito para carregar dados do dashboard (progresso, métricas)
  // AGORA DEPENDERÁ do currentActiveExamPositionId
  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.id && currentActiveExamPositionId) { // Só carrega se tiver usuário e foco definido
        setLoadingDashboardData(true);
        console.log(`[StudentDashboard] Carregando dados para o cargo em foco: ${currentActiveExamPositionId}`);
        try {
          // TODO: SUBSTITUIR MOCKS por chamadas reais que usem user.id E currentActiveExamPositionId
          const [progress, studentMetricsData] = await Promise.all([
            fetchOverallProgress(user.id, currentActiveExamPositionId), // Modifique para aceitar positionId
            fetchStudentMetrics(user.id, currentActiveExamPositionId)   // Modifique para aceitar positionId
          ]);
          
          setOverallProgress(progress);
          setMetrics(studentMetricsData);
        } catch (error) {
          console.error("Error loading dashboard data for focused position:", error);
          toast.error("Erro ao carregar dados do dashboard");
        } finally {
          setLoadingDashboardData(false);
        }
      } else if (!currentActiveExamPositionId && user?.id && !isLoadingFocus) {
        // Se o usuário está logado, não está carregando o foco, mas não tem foco definido
        // (pode acontecer se ele não tiver nenhuma matrícula em student_exams)
        setLoadingDashboardData(false); // Para de carregar, pois não há o que buscar
        setOverallProgress(0);
        setMetrics({ questionsResolved: 0, practiceDays: { current: 0, total: 0 }, performance: 0, ranking: { position: 0, total: 0 }, practiceTime: { hours: 0, minutes: 0 }});
      }
    };
    
    loadDashboardData();
  }, [user, currentActiveExamPositionId, isLoadingFocus]); // Adicionado isLoadingFocus para esperar a definição do foco


  // Lógica para Concursos Recomendados (pode ser mantida se for independente do foco)
  // const { data: recommendedExams, isLoading: recommendedExamsLoading } = useRecommendedExams(searchQuery, true);


  const handleNavigateToPractice = () => {
    if (currentActiveExamPositionId) {
      navigate('/dashboard/student/practice');
    } else {
      toast.info("Por favor, selecione um concurso de foco para continuar estudando.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <DashboardHeader 
        userName={profile?.name || user?.email || 'Estudante'}
        showFocusSelector={true} // Passa prop para o header exibir o seletor
        linkedPositions={linkedPositions}
        currentStudentExamId={currentStudentExamId}
        isLoadingFocus={isLoadingFocus}
        onFocusChange={async (studentExamId) => {
          const selectedPos = linkedPositions?.find(p => p.student_exam_id === studentExamId);
          if (selectedPos) {
            await setCurrentFocus(selectedPos.student_exam_id, selectedPos.exam_position_id);
          }
        }}
        onContinueStudying={handleNavigateToPractice} // Passa a função para o botão no header
        isContinueStudyingDisabled={!currentActiveExamPositionId || isLoadingFocus}
      />
      
      {isLoadingFocus && <p>Carregando informações de foco...</p>}

      {!isLoadingFocus && !currentActiveExamPositionId && linkedPositions && linkedPositions.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-yellow-700">Selecione seu Foco</CardTitle>
            <CardDescription className="text-yellow-600">
              Escolha um concurso na lista acima para ver seu progresso e começar a praticar.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoadingFocus && linkedPositions && linkedPositions.length === 0 && (
         <Card>
            <CardHeader>
                <CardTitle>Nenhum Concurso Vinculado</CardTitle>
                <CardDescription>
                Você ainda não está se preparando para nenhum concurso específico na plataforma. 
                Explore os concursos disponíveis e escolha um para começar!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => navigate('/')}>Explorar Concursos</Button> {/* Ajuste a rota se necessário */}
            </CardContent>
         </Card>
      )}

      {currentActiveExamPositionId && (
        <>
          <ProgressOverview 
            overallProgress={overallProgress}
            metrics={metrics}
            loading={loadingDashboardData} // Usa o estado de loading dos dados do dashboard
          />
          
          {/* Seção Meus Concursos - agora usa linkedPositions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold tracking-tight">Meus Concursos</h2>
              {/* <Button variant="link" onClick={() => navigate('/student/my-exams')}>Ver todos</Button>  // Link para uma página de "gerenciar meus concursos" no futuro */}
            </div>
            {isLoadingFocus && <p>Carregando seus concursos...</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {linkedPositions && linkedPositions.filter(pos => pos.overall_exam_status !== 'completed').map(pos => ( // Exemplo: não mostrar completos aqui
                <Card key={pos.student_exam_id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{pos.position_name}</CardTitle>
                    <CardDescription>Status do Edital: {pos.overall_exam_status || 'N/A'}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Adicionar mais detalhes do concurso se necessário, ex: órgão, banca */}
                    {/* <p className="text-sm text-muted-foreground">Órgão: {pos.organ_name_if_available}</p> */}
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button 
                      className="w-full"
                      onClick={async () => {
                        await setCurrentFocus(pos.student_exam_id, pos.exam_position_id);
                        handleNavigateToPractice();
                      }}
                      variant={pos.is_current_focus ? "default" : "outline"}
                    >
                      {pos.is_current_focus ? "Continuar Foco Atual" : "Focar e Continuar Estudos"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Seção Concursos Recomendados (mantida como estava, ajuste se necessário) */}
          {/* <ExamsSection
            // ... suas props para recommendedExams ...
          /> */}
          
          {/* Gráfico de Desempenho por Tópico - AGORA DEVE USAR currentActiveExamPositionId */}
          <TopicPerformanceChart 
            studentId={user?.id || ""} 
            examPositionId={currentActiveExamPositionId || ""} // Passa o cargo em foco
            // examId={...} // Se o gráfico precisar do ID do EXAME e não do CARGO, ajuste aqui
          />
        </>
      )}
    </div>
  );
}