import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExamPosition, StudentExam } from "@/types/student";
import { Calendar, ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ExamCardProps {
  exam: ExamPosition | StudentExam;
  type: "subscribed" | "suggested";
}

export default function ExamCard({ exam, type }: ExamCardProps) {
  const examData = 'exam_position' in exam && exam.exam_position ? exam.exam_position : exam as ExamPosition;

  if (!examData?.id) {
    console.warn('[ExamCard] Dados de exame inválidos ou ausentes:', exam);
    return null;
  }

  const examPositionId = examData.id;
  const institutionName = examData.exam?.exam_institution?.name;
  const logoInstitution = examData.exam?.exam_institution?.logo_institution;
  const examStatus = examData.exam?.status;
  const examDate = 'exam_date' in examData ? examData.exam_date : (examData.exam?.exam_date_id ? 'Data a buscar' : null); // Lógica de data pode precisar de ajuste
  const progressPercentage = 'progress_percentage' in exam ? exam.progress_percentage : null;

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        {/* Container para Logo centralizada */}
        <div className="flex justify-center mb-3">
          {logoInstitution ? (
            <img
              src={`data:image/png;base64,${logoInstitution}`}
              alt={institutionName || 'Logo da instituição'}
              className="h-12 w-auto object-contain max-w-[80%]"
            />
          ) : (
            <Building2 className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        {/* Container para Título, Subtítulo e Status Badge */}
        <div className="flex flex-col">
           <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg truncate">{examData.name}</h3>
              {examStatus === "open" && (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  Abertas
                </div>
              )}
              {examStatus === "upcoming" && (
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  Em breve
                </div>
              )}
              {examStatus === "closed" && (
                <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  Encerrado
                </div>
              )}
            </div>
          <p className="text-muted-foreground text-sm truncate">{institutionName || 'Instituição não especificada'}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-2"> {/* Ajuste de padding top */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <p className="text-muted-foreground">Vagas</p>
            <p className="font-medium">{examData.vagas ?? "-"}</p> {/* Use ?? para fallback */}
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

        {type === 'subscribed' && progressPercentage !== null && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Lógica de data da prova precisa ser ajustada com base em como você armazena/busca exam_dates */}
        {/* {examDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Prova: {new Date(examDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )} */}
      </CardContent>
      <CardFooter className="mt-auto"> {/* Garante que o footer fique embaixo */}
        {type === "subscribed" ? (
          <Link to={`/student/exams/${examPositionId}`} className="w-full">
            <Button className="w-full">
              Continuar estudos <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
           <Link to={`/student/exams/${examPositionId}`} className="w-full">
             <Button variant="outline" className="w-full">
               Acessar
             </Button>
           </Link>
        )}
      </CardFooter>
    </Card>
  );
}
