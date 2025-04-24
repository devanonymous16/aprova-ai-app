
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
import { 
  fetchStudentExams, 
  fetchSuggestedExams, 
  fetchOverallProgress,
  mockStudentExams 
} from '@/services/mockStudentData';
import { StudentExam, ExamPosition } from '@/types/student';

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribedExams, setSubscribedExams] = useState<StudentExam[]>([]);
  const [suggestedExams, setSuggestedExams] = useState<ExamPosition[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  
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
  
  // Filter exams based on search query
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
      
      {/* Progresso geral */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between">
            <span>Progresso Geral</span>
            {overallProgress > 30 && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Bom progresso
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concursos ativos</p>
                <p className="text-xl font-bold">{subscribedExams.length}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart2 className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média de desempenho</p>
                <p className="text-xl font-bold">68%</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tópicos críticos</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso geral</span>
              <span>{Math.round(overallProgress)}% concluído</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>
      
      {/* Concursos inscritos */}
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
      
      {/* Concursos sugeridos */}
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
      
      {/* Performance por tópico */}
      {subscribedExams.length > 0 && (
        <TopicPerformanceChart 
          studentId={user?.id || "current-user-id"} 
          examId={subscribedExams[0].exam_position_id}
        />
      )}
    </div>
  );
}
