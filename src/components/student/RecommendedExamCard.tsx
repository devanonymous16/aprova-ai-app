
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Exam, ExamPosition } from "@/types/student";
import { Calendar } from "lucide-react";

interface RecommendedExamCardProps {
  exam: Exam;
}

export default function RecommendedExamCard({ exam }: RecommendedExamCardProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const navigate = useNavigate();
  
  const handleContinue = () => {
    if (selectedPosition) {
      navigate(`/subscribe/${selectedPosition}`);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-all">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{exam.exam_institution.name}</h3>
            <p className="text-sm text-muted-foreground">
              {exam.exam_positions.length} {exam.exam_positions.length === 1 ? 'cargo disponível' : 'cargos disponíveis'}
            </p>
          </div>
          {exam.status === "open" && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Inscrições abertas
            </div>
          )}
          {exam.status === "upcoming" && (
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Em breve
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {exam.exam_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Prova: {new Date(exam.exam_date.date).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        <Select value={selectedPosition} onValueChange={setSelectedPosition}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cargo" />
          </SelectTrigger>
          <SelectContent>
            {exam.exam_positions.map((position) => (
              <SelectItem key={position.id} value={position.id}>
                {position.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      
      <CardFooter className="mt-auto">
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
