import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Exam, ExamPosition } from "@/types/student";
import { Calendar, Building2 } from "lucide-react";

interface RecommendedExamCardProps {
  exam: Exam & { exam_positions: ExamPosition[] | null };
  examDate?: { date: string | null } | null;
}

export default function RecommendedExamCard({ exam, examDate }: RecommendedExamCardProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedPosition) {
      navigate(`/subscribe/${selectedPosition}`);
    }
  };

  if (!exam?.id || !exam.exam_institution?.name) {
     console.warn("Dados incompletos para RecommendedExamCard", exam);
     return null;
  }

  const logoInstitution = exam.exam_institution?.logo_institution;
  const positions = exam.exam_positions || [];
  const dateToShow = examDate?.date || exam.exam_date?.date;


  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        {/* Container para Logo centralizada */}
        <div className="flex justify-center mb-3">
          {logoInstitution ? (
            <img
              src={`data:image/png;base64,${logoInstitution}`}
              alt={exam.exam_institution.name}
              className="h-12 w-auto object-contain max-w-[80%]"
            />
          ) : (
            <Building2 className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
         {/* Container para Título, Qtde Cargos e Status Badge */}
         <div className="flex flex-col">
           <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold truncate">{exam.exam_institution.name}</h3>
               {exam.status === "open" && (
                 <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                   Abertas
                 </div>
               )}
               {exam.status === "upcoming" && (
                 <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                   Em breve
                 </div>
               )}
               {exam.status === "closed" && (
                 <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                   Encerrado
                 </div>
               )}
           </div>
           <p className="text-sm text-muted-foreground">
             {positions.length} {positions.length === 1 ? 'cargo disponível' : 'cargos disponíveis'}
           </p>
         </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2"> {/* Ajuste de padding top */}
        {dateToShow && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Prova: {new Date(dateToShow).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        <Select value={selectedPosition} onValueChange={setSelectedPosition} disabled={positions.length === 0}>
          <SelectTrigger>
            <SelectValue placeholder={positions.length > 0 ? "Selecione um cargo" : "Nenhum cargo encontrado"} />
          </SelectTrigger>
          <SelectContent>
            {positions.map((position) => (
              <SelectItem key={position.id} value={position.id}>
                {position.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>

      <CardFooter className="mt-auto"> {/* Garante que o footer fique embaixo */}
        <Button
          className="w-full"
          disabled={!selectedPosition}
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </CardFooter>
    </Card>
  );
}
