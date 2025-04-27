
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';
import ExamCard from '@/components/student/ExamCard';
import { StudentExam, ExamPosition } from '@/types/student';
import SearchBar from '@/components/student/SearchBar';

interface ExamsSectionProps {
  loading: boolean;
  subscribedExams: StudentExam[];
  suggestedExams: ExamPosition[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function ExamsSection({
  loading,
  subscribedExams,
  suggestedExams,
  searchQuery,
  onSearchChange,
}: ExamsSectionProps) {
  // Filter subscribed exams - make sure to check for exam_position property
  const filteredSubscribedExams = subscribedExams.filter(exam => 
    exam.exam_position && (
      exam.exam_position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.exam_position.organization.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  // Filter suggested exams
  const filteredSuggestedExams = suggestedExams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
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
    </>
  );
}
