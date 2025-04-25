import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamPosition, StudentExam } from "@/types/student";
import { ArrowLeft, Calendar, CircleDollarSign, Users, BookOpen, BarChart2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export default function StudentExamDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [exam, setExam] = useState<ExamPosition | null>(null);
  const [studentExam, setStudentExam] = useState<StudentExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Load exam position details
        const { data: examData, error: examError } = await supabase
          .from('exam_positions')
          .select('*')
          .eq('id', id)
          .single();
          
        if (examError) {
          console.error("Error loading exam details:", examError);
          toast.error("Erro ao carregar detalhes do exame");
          return;
        }

        if (!examData) {
          toast.error("Exame não encontrado");
          return;
        }

        setExam(examData as ExamPosition);
        
        // 2. Check student access
        if (user) {
          const { data: accessData, error: accessError } = await supabase
            .from('student_exams')
            .select('*')
            .eq('student_id', user.id)
            .eq('exam_position_id', id)
            .maybeSingle();
            
          if (accessError) {
            console.error("Error checking access:", accessError);
            toast.error("Erro ao verificar acesso");
            return;
          }

          if (accessData) {
            setStudentExam(accessData as StudentExam);
          }
        }
        
        setAccessChecked(true);
      } catch (error) {
        console.error("Error in loadData:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    
    if (id && user) {
      loadData();
    }
  }, [id, user]);
  
  useEffect(() => {
    if (exam) {
      document.title = `Forefy | ${exam.title} - ${exam.organization}`;
    } else {
      document.title = "Forefy | Detalhes do Exame";
    }
  }, [exam]);
  
  if (loading || !accessChecked) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!exam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Exame não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Não foi possível encontrar os detalhes do exame solicitado.
          </p>
          <Link to="/student/exams">
            <Button>Voltar para Meus Exames</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render different UIs based on access
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/student/exams">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Exames
        </Button>
      </Link>
      
      {/* Header section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold font-heading">{exam.title}</h1>
            {exam.status === "open" && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Inscrições abertas
              </div>
            )}
          </div>
          <p className="text-xl text-muted-foreground mb-6">{exam.organization}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Vagas</p>
                <p className="font-medium">{exam.vacancy_count || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Salário</p>
                <p className="font-medium">
                  {exam.salary 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(exam.salary)
                    : "-"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data da prova</p>
                <p className="font-medium">
                  {exam.exam_date 
                    ? new Date(exam.exam_date).toLocaleDateString('pt-BR')
                    : "A definir"
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none mb-6">
            <p>{exam.description || "Sem descrição disponível para este concurso."}</p>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              {studentExam ? (
                <div className="space-y-4">
                  <Link to="/student/study-plan" className="block w-full">
                    <Button className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" /> Ver plano de estudos
                    </Button>
                  </Link>
                  <Link to={`/student/autodiagnosis/${exam.id}`} className="block w-full">
                    <Button variant="outline" className="w-full">
                      <BarChart2 className="mr-2 h-4 w-4" /> Fazer autodiagnóstico
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Plano Premium</h4>
                      <span className="text-xl font-bold">R$ 129,90</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Acesso completo aos materiais e questões do concurso.
                    </p>
                    <Button className="w-full">Assinar agora</Button>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Plano Básico</h4>
                      <span className="text-xl font-bold">R$ 79,90</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Acesso aos materiais essenciais e questões básicas por 6 meses.
                    </p>
                    <Button variant="outline" className="w-full">Assinar plano</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Details cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da prova</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Conteúdo Programático</h4>
                  <p className="text-sm text-muted-foreground">
                    O conteúdo inclui Direito Constitucional, Direito Administrativo, 
                    Português, Raciocínio Lógico e conhecimentos específicos da área.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Duração da Prova</h4>
                  <p className="text-sm text-muted-foreground">
                    5 horas para resolver aproximadamente 100 questões.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Prazo de Inscrição</h4>
                  <p className="text-sm text-muted-foreground">
                    {exam.registration_deadline ? (
                      <>Até {new Date(exam.registration_deadline).toLocaleDateString('pt-BR')}</>
                    ) : (
                      "Ainda não divulgado"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Por que estudar conosco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 p-2 rounded-full text-primary">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Material exclusivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Conteúdo preparado por especialistas aprovados nos principais concursos do país.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 p-2 rounded-full text-primary">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Plano personalizado</h4>
                  <p className="text-sm text-muted-foreground">
                    Algoritmo de IA cria um plano de estudos específico para suas necessidades.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 p-2 rounded-full text-primary">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Banco de questões</h4>
                  <p className="text-sm text-muted-foreground">
                    Milhares de questões comentadas e organizadas por tópico.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
