import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Search,
  BarChart2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import SearchBar from '@/components/student/SearchBar';
import ExamCard from '@/components/student/ExamCard';
import TopicPerformanceChart from '@/components/student/TopicPerformanceChart';
import DashboardMetrics from "@/components/student/DashboardMetrics";
import { 
  fetchStudentExams, 
  fetchSuggestedExams, 
  fetchOverallProgress,
  mockStudentExams 
} from '@/services/mockStudentData';
import { StudentExam, ExamPosition } from '@/types/student';
import { toast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribedExams, setSubscribedExams] = useState<StudentExam[]>([]);
  const [suggestedExams, setSuggestedExams] = useState<ExamPosition[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolvedQuestions, setResolvedQuestions] = useState(210);
  const [correctQuestions, setCorrectQuestions] = useState(157);
  const [daysPracticed, setDaysPracticed] = useState(29);
  const [totalDays, setTotalDays] = useState(45);
  const [timePracticedMinutes, setTimePracticedMinutes] = useState(1415);
  const [ranking, setRanking] = useState({ globalRank: 5, totalStudents: 124 });
  const [showRankingDetails, setShowRankingDetails] = useState(false);
  const [showTimeDetails, setShowTimeDetails] = useState(false);

  useEffect(() => {
    document.title = 'Forefy | Dashboard do Estudante';
    
    const loadData = async () => {
      setLoading(true);
      try {
        if (user) {
          const exams = await fetchStudentExams(user.id);
          setSubscribedExams(exams);
          
          const suggested = await fetchSuggestedExams();
          setSuggestedExams(suggested);
          
          const progress = await fetchOverallProgress(user.id);
          setOverallProgress(progress);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  const filteredSubscribedExams = subscribedExams.filter(exam => 
    exam.exam_position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.exam_position.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSuggestedExams = suggestedExams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleExamClick = (examId: string, isFirstAccess: boolean) => {
    if (isFirstAccess) {
      navigate(`/student/autodiagnosis/${examId}`);
    } else {
      navigate(`/student/exams/${examId}`);
    }
  };
  
  const performance = resolvedQuestions > 0 ? Math.round((correctQuestions / resolvedQuestions) * 100) : 0;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Olá, {profile?.name || 'Estudante'}!</h1>
          <p className="text-muted-foreground">
            Bem-vindo(a) ao seu painel de estudos personalizado
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/student/study-plan">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Ver plano de estudos
            </Button>
          </Link>
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Continuar estudando
          </Button>
        </div>
      </div>
      
      <DashboardMetrics 
        resolvedQuestions={resolvedQuestions}
        correctQuestions={correctQuestions}
        daysPracticed={daysPracticed}
        totalDays={totalDays}
        performance={performance}
        ranking={ranking}
        timePracticedMinutes={timePracticedMinutes}
        onRankingClick={() => setShowRankingDetails(true)}
        onTimeClick={() => setShowTimeDetails(true)}
      />

      {showRankingDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-bold mb-2">Ranking de acertos por tópico</h3>
            <p className="text-sm text-muted-foreground mb-4">
              (Visualização detalhada do ranking por tópicos será exibida aqui...)
            </p>
            <Button onClick={() => setShowRankingDetails(false)} className="mt-4">
              Fechar
            </Button>
          </div>
        </div>
      )}
      
      {showTimeDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-bold mb-2">Tempo praticando por tópico</h3>
            <p className="text-sm text-muted-foreground mb-4">
              (Visualização detalhada do tempo praticado por tópico será exibida aqui...)
            </p>
            <Button onClick={() => setShowTimeDetails(false)} className="mt-4">
              Fechar
            </Button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>
      
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Meus Concursos</h2>
          <Link to="/student/exams">
            <Button variant="ghost" className="text-sm">
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredSubscribedExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscribedExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} type="subscribed" />
            ))}
          </div>
        ) : subscribedExams.length > 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Nenhum concurso encontrado para "{searchQuery}"
          </p>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">Você ainda não está inscrito em nenhum concurso</h3>
            <p className="text-muted-foreground mb-4">
              Explore os concursos disponíveis abaixo e comece a se preparar.
            </p>
            <Button>
              Explorar concursos
            </Button>
          </div>
        )}
      </div>
      
      {suggestedExams.length > 0 && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Concursos Recomendados</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredSuggestedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuggestedExams.slice(0, 3).map(exam => (
                <ExamCard key={exam.id} exam={exam} type="suggested" />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum concurso sugerido encontrado para "{searchQuery}"
            </p>
          )}
        </div>
      )}
      
      {subscribedExams.length > 0 && (
        <TopicPerformanceChart 
          studentId={user?.id || "current-user-id"} 
          examId={subscribedExams[0].exam_position_id}
        />
      )}
    </div>
  );
}
