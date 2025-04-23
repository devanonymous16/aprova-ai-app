
import ExamCard from "@/components/student/ExamCard";
import { Button } from "@/components/ui/button";
import { ExamPosition } from "@/types/student";

interface SuggestedExamsSectionProps {
  exams: ExamPosition[];
  filteredExams: ExamPosition[];
  loading: boolean;
  searchQuery: string;
}

export default function SuggestedExamsSection({ exams, filteredExams, loading, searchQuery }: SuggestedExamsSectionProps) {
  if (exams.length === 0 && !loading) {
    return null;
  }
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Concursos Recomendados</h2>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.slice(0, 3).map(exam => (
            <ExamCard key={exam.id} exam={exam} type="suggested" />
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          Nenhum concurso sugerido encontrado para "{searchQuery}"
        </p>
      )}
    </div>
  );
}
