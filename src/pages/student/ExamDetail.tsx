//Propósito: Exibir informações completas sobre um concurso ou cargo específico, 
//como edital, conteúdo programático detalhado, número de vagas, salário, etc.

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExamPosition, StudentExam, ExamLevelData, EducationLevel } from '@/types/student';
import { 
  ArrowLeft, Calendar, CircleDollarSign, Users, BookOpen, BarChart2, 
  Check, Timer 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export default function StudentExamDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [exam, setExam] = useState<ExamPosition | null>(null);
  const [studentExam, setStudentExam] = useState<StudentExam | null>(null);
  const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  
  useEffect(() => {
    console.log('ExamDetail: Component mounted', {
      examId: id,
      hasUser: !!user,
      userId: user?.id,
      loading,
      accessChecked
    });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      console.log('ExamDetail: Iniciando busca de dados para ID:', id);
      if (!id || !user) {
        console.log('ExamDetail: ID ou user não disponível, abortando');
        return;
      }

      try {
        console.log('ExamDetail: Setando isLoading = true');
        setLoading(true);

        // 1. First check student access
        console.log('ExamDetail: Consultando student_exams...');
        const { data: accessData, error: accessError } = await supabase
          .from('student_exams')
          .select('*')
          .eq('student_id', user.id)
          .eq('exam_position_id', id)
          .maybeSingle();
        
        console.log('ExamDetail: Resultado student_exams:', { accessData, accessError });
        
        if (accessError) {
          console.error('ExamDetail: Erro ao verificar acesso:', accessError);
          toast.error('Erro ao verificar acesso ao exame');
          return;
        }

        if (accessData) {
          console.log('ExamDetail: Acesso confirmado, setando studentExam');
          setStudentExam(accessData as StudentExam);
        }

        // 2. Load exam position details
        console.log('ExamDetail: Consultando detalhes do cargo/nível...');
        const { data: examData, error: examError } = await supabase
          .from('exam_positions')
          .select(`
            *,
            exam:exams(
              *,
              institution:exam_institutions(name)
            ),
            education_level:exam_level_of_educations(*)
          `)
          .eq('id', id)
          .single();
          
        console.log('ExamDetail: Resultado detalhes cargo/nível:', { examData, examError });

        if (examError) {
          console.error('ExamDetail: Erro ao carregar detalhes do exame:', examError);
          toast.error('Erro ao carregar detalhes do exame');
          return;
        }

        if (!examData) {
          console.log('ExamDetail: Exame não encontrado');
          toast.error('Exame não encontrado');
          return;
        }

        console.log('ExamDetail: Atualizando estados com dados recebidos');
        setExam(examData as unknown as ExamPosition);
        if (examData.education_level) {
          setEducationLevel(examData.education_level[0] as EducationLevel);
        }
        
      } catch (error) {
        console.error('ExamDetail: Erro durante busca de dados:', error);
        toast.error('Erro ao carregar dados do exame');
      } finally {
        console.log('ExamDetail: Tentando setar isLoading = false');
        setLoading(false);
        setAccessChecked(true);
        console.log('ExamDetail: Estados finais:', {
          loading: false,
          accessChecked: true,
          hasExam: !!exam,
          hasStudentExam: !!studentExam,
          hasEducationLevel: !!educationLevel
        });
      }
    };
    
    loadData();
  }, [id, user]);
  
  useEffect(() => {
    if (exam) {
      document.title = `Forefy | ${exam.title} - ${exam.organization}`;
    } else {
      document.title = "Forefy | Detalhes do Exame";
    }
  }, [exam]);
  
  useEffect(() => {
    console.log('ExamDetail: States updated:', {
      loading,
      accessChecked,
      hasExam: !!exam,
      hasStudentExam: !!studentExam,
      hasEducationLevel: !!educationLevel
    });
  }, [loading, accessChecked, exam, studentExam, educationLevel]);
  
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
  
  if (!studentExam && educationLevel) {
    const monthlyPayment = (educationLevel.full_price / 12).toFixed(2);
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/student/exams">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Exames
          </Button>
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            Assine para Acessar: {exam.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {exam.organization}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="p-6">
            <CardHeader className="pb-3">
              <CardTitle>Plano Completo Forefy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <span className="text-lg font-medium block mb-1">Anual à vista</span>
                  <span className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(educationLevel.promo_price)}
                  </span>
                </div>
                
                <div className="p-4">
                  <span className="text-lg font-medium block mb-1">ou Parcelado</span>
                  <span className="text-2xl text-muted-foreground">
                    12x de{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(monthlyPayment))}
                  </span>
                </div>
                
                <Button className="w-full text-lg py-6" size="lg">
                  Assinar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Benefícios Inclusos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Acesso a todos os materiais do curso</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Plano de Estudos Personalizado (PEP)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Suporte com IA para dúvidas</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Banco de questões comentadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Simulados e provas anteriores</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/student/exams">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Exames
        </Button>
      </Link>
      
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
                <Timer className="h-5 w-5 text-primary mt-1" />
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
