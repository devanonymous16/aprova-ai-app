
import { Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface StudentDashboardHeaderProps {
  studentName: string | undefined;
}

export default function StudentDashboardHeader({ studentName }: StudentDashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold font-heading">Olá, {studentName || "Estudante"}!</h1>
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
  );
}
