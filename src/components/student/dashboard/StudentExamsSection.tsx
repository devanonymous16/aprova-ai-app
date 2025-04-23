
import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ExamCard from "@/components/student/ExamCard";
import { StudentExam } from "@/types/student";

interface StudentExamsSectionProps {
  exams: StudentExam[];
  filteredExams: StudentExam[];
  loading: boolean;
  searchQuery: string;
}

export default function StudentExamsSection({ exams, filteredExams, loading, searchQuery }: StudentExamsSectionProps) {
  return (
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
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => (
            <ExamCard key={exam.id} exam={exam} type="subscribed" />
          ))}
        </div>
      ) : exams.length > 0 ? (
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
  );
}
