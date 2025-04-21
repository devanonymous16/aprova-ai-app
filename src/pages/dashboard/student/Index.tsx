import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Clock,
  CheckSquare,
  BarChart2,
  Calendar,
  FileText,
  AlarmClock,
  Award,
  TrendingUp
} from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const isB2BStudent = false; // Default value, can be derived from profile if needed later
  
  useEffect(() => {
    document.title = 'Forefy | Dashboard do Estudante';
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Olá, {profile?.name || 'Estudante'}!</h1>
          <p className="text-muted-foreground">
            {isB2BStudent ? 
              'Bem-vindo(a) ao seu painel de estudos do Cursinho XYZ' : 
              'Bem-vindo(a) ao seu painel de estudos personalizado'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="hidden md:flex">
            <Calendar className="h-4 w-4 mr-2" />
            Ver cronograma
          </Button>
          <Button>
            <AlarmClock className="h-4 w-4 mr-2" />
            Iniciar sessão
          </Button>
        </div>
      </div>
      
      {/* Progresso do dia */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between">
            <span>Progresso do dia</span>
            <span className="text-sm bg-success-50 text-success-700 px-2 py-1 rounded-full flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              15% acima da média
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-primary-900" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo de estudo</p>
                <p className="text-xl font-bold">2h 15min</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-secondary-100 p-3 rounded-full">
                <CheckSquare className="h-5 w-5 text-secondary-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questões resolvidas</p>
                <p className="text-xl font-bold">37 / 50</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-success-100 p-3 rounded-full">
                <Award className="h-5 w-5 text-success-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de acertos</p>
                <p className="text-xl font-bold">72%</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <BookOpen className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Materiais estudados</p>
                <p className="text-xl font-bold">3 / 5</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Plano diário</span>
              <span>65% concluído</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            Seu foco hoje está em Direito Constitucional e Português
          </p>
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="practice">Questões</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle>Próxima sessão de estudos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary-900" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">Direito Constitucional - Controle de Constitucionalidade</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Duração estimada: 45 minutos • Prioridade: Alta
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Material teórico</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">15 questões práticas</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">1 vídeo explicativo</span>
                        </div>
                        <div className="flex gap-2">
                          <Button>Começar agora</Button>
                          <Button variant="outline">Visualizar conteúdo</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Desempenho por disciplina</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Direito Constitucional", progress: 78, },
                      { name: "Direito Administrativo", progress: 62, },
                      { name: "Direito Civil", progress: 45, },
                      { name: "Português", progress: 84, },
                      { name: "Raciocínio Lógico", progress: 71, },
                    ].map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.name}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle>Cronograma</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="rounded-md bg-primary-50 border border-primary-100 p-2 text-primary-900 flex flex-col items-center justify-center min-w-[48px] h-12">
                          <span className="text-xs font-medium">
                            {["HOJE", "QUA", "QUI"][i-1]}
                          </span>
                          <span className="font-bold">
                            {["12", "13", "14"][i-1]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {i === 1 ? 
                              'Direito Constitucional e Português' : 
                              i === 2 ? 
                              'Direito Administrativo' : 
                              'Raciocínio Lógico e Informática'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {i === 1 ? 
                              '3h previstas • 45 questões' : 
                              i === 2 ? 
                              '2h previstas • 30 questões' : 
                              '2h30 previstas • 40 questões'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="ghost" className="w-full" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver cronograma completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Simulados agendados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-100">
                      <p className="font-medium">Simulado TJ-SP</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        15 de junho • 9:00 - 13:00
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          Detalhes
                        </Button>
                        <Button size="sm" className="text-xs bg-secondary-600 hover:bg-secondary-700">
                          Lembrete
                        </Button>
                      </div>
                    </div>
                    
                    <Button variant="ghost" className="w-full" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver todos os simulados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="materials">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Material de Estudo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <BookOpen className="h-16 w-16 text-primary-900 mb-4" />
                <h3 className="text-lg font-medium mb-2">Biblioteca de Materiais</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Acesse materiais teóricos, vídeo-aulas e resumos organizados por disciplina. 
                  Todo conteúdo é personalizado conforme seu plano de estudos.
                </p>
                <Button>Acessar Materiais</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="practice">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Banco de Questões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <CheckSquare className="h-16 w-16 text-secondary-700 mb-4" />
                <h3 className="text-lg font-medium mb-2">Pratique com Questões</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Resolva questões de concursos anteriores e tenha acesso a explicações 
                  detalhadas. Treine com simulados e questões adaptativas ao seu nível.
                </p>
                <Button>Acessar Questões</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Acompanhamento de Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <BarChart2 className="h-16 w-16 text-success-700 mb-4" />
                <h3 className="text-lg font-medium mb-2">Relatórios e Estatísticas</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Visualize seu progresso, identifique pontos fortes e áreas que precisam 
                  de mais atenção. Acompanhe métricas e evolução ao longo do tempo.
                </p>
                <Button>Ver Estatísticas</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
