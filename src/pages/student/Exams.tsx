
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchSuggestedExams } from "@/services/mockStudentData";
import { useStudentExams } from "@/hooks/useStudentExams";
import { ExamPosition } from "@/types/student";
import ExamCard from "@/components/student/ExamCard";
import SearchBar from "@/components/student/SearchBar";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function StudentExams() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { exams: subscribedExams, loading: examsLoading } = useStudentExams(user?.id);
  const [suggestedExams, setSuggestedExams] = useState<ExamPosition[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    document.title = "Forefy | Meus Exames";
    
    const loadData = async () => {
      setLoading(true);
      try {
        const suggested = await fetchSuggestedExams();
        setSuggestedExams(suggested);
      } catch (error) {
        console.error("Error loading exam data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  // Filter exams based on search query
  const filteredSubscribedExams = subscribedExams.filter(exam => 
    exam.exam_position && (
      exam.exam_position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.exam_position.organization.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const filteredSuggestedExams = suggestedExams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link to="/student/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-heading mt-4">Meus Exames</h1>
        <p className="text-muted-foreground">
          Gerencie seus exames e explore novos concursos
        </p>
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>
      
      {/* Concursos inscritos */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Meus Concursos</h2>
        
        {loading || examsLoading ? (
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
          </div>
        )}
      </div>
      
      {/* Concursos sugeridos */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Concursos Disponíveis</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredSuggestedExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestedExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} type="suggested" />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Nenhum concurso sugerido encontrado para "{searchQuery}"
          </p>
        )}
      </div>
    </div>
  );
}
