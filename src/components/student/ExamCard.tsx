
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExamPosition, StudentExam } from "@/types/student";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ExamCardProps {
  exam: ExamPosition | StudentExam;
  type: "subscribed" | "suggested";
}

export default function ExamCard({ exam, type }: ExamCardProps) {
  // For subscribed exams, get the exam position data
  const examData = 'exam_position' in exam ? exam.exam_position : exam;
  
  if (!examData) return null; // Safety check for null exam_position
  
  const examPositionId = examData.id;
  const institutionName = examData.exam?.exam_institution?.name;
  
  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{examData.name}</h3>
            <p className="text-muted-foreground text-sm">{institutionName || 'Instituição não especificada'}</p>
          </div>
          {examData.status === "open" && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Inscrições abertas
            </div>
          )}
          {examData.status === "upcoming" && (
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Em breve
            </div>
          )}
          {examData.status === "closed" && (
            <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              Encerrado
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <p className="text-muted-foreground">Vagas</p>
            <p className="font-medium">{examData.vagas || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Salário</p>
            <p className="font-medium">
              {examData.salario_inicial 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(examData.salario_inicial)
                : "-"
              }
            </p>
          </div>
        </div>
        
        {'progress_percentage' in exam && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso</span>
              <span>{exam.progress_percentage}%</span>
            </div>
            <Progress value={exam.progress_percentage} className="h-2" />
          </div>
        )}
        
        {examData.exam_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Prova: {new Date(examData.exam_date).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {type === "subscribed" ? (
          <Link to={`/student/exams/${examPositionId}`} className="w-full">
            <Button className="w-full">
              Continuar estudos <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to={`/student/exams/${examPositionId}`} className="w-full">
            <Button variant="outline" className="w-full">
              Ver detalhes
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
