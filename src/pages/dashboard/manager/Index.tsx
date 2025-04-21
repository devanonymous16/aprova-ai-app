
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  BookOpen, 
  BarChart2,
  Clipboard,
  Calendar,
  MessageSquare,
  Award,
  Settings
} from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  
  useEffect(() => {
    document.title = 'Forefy | Painel de Gerente';
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Painel de Gerente</h1>
          <p className="text-muted-foreground">
            Gerencie seus alunos e monitore o desempenho da sua instituição
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-secondary-50 p-2 rounded-lg border border-secondary-100">
          <div className="bg-white p-1 rounded border border-secondary-100">
            <Settings className="h-5 w-5 text-secondary-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Institução</p>
            <p className="text-xs text-muted-foreground">Cursinho Preparatório XYZ</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPI Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">387</div>
            <p className="text-xs text-muted-foreground">
              +24 novos alunos este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Engajamento
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74%</div>
            <p className="text-xs text-muted-foreground">
              +3% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Média de Aprovação
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 4 concursos
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="content">Materiais</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
            <div className="md:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Desempenho por Disciplina</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                    <p className="text-muted-foreground text-center">
                      Gráfico de desempenho seria exibido aqui
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                        <div className="rounded-md bg-primary-50 border border-primary-100 p-2 text-primary-900 flex flex-col items-center justify-center min-w-[48px] h-12">
                          <span className="text-xs">{["JUN", "JUL", "AGO"][i-1]}</span>
                          <span className="font-bold">{[15, 22, 5][i-1]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {i === 1 ? 
                              'Simulado TJ-SP' : 
                              i === 2 ? 
                              'Revisão de Direito Constitucional' : 
                              'Webinar: Técnicas de Estudo'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {i === 1 ? 
                              '9:00 - 13:00 • Online' : 
                              i === 2 ? 
                              '19:00 - 21:00 • Sala Virtual 3' : 
                              '20:00 - 21:30 • Online'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="ghost" className="w-full" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver calendário completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Mensagens Recentes</span>
                  <span className="text-xs bg-primary-100 text-primary-900 px-2 py-1 rounded-full">
                    5 novas
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {["JP", "MS", "AT"][i-1]}
                        </div>
                        {i === 1 && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {["João Pedro", "Maria Silva", "André Torres"][i-1]}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {i === 1 ? 
                            'Professor, tenho dúvidas sobre o último simulado. Você poderia revisar...' : 
                            i === 2 ? 
                            'Gostaria de saber quando será disponibilizado o material de Direito Adm...' : 
                            'Confirmando a reunião de amanhã sobre o cronograma de estudos...'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="ghost" className="w-full" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ver todas as mensagens
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tarefas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                        defaultChecked={i > 2}
                      />
                      <span className={`text-sm flex-1 ${i > 2 ? 'line-through text-gray-400' : ''}`}>
                        {i === 1 ? 
                          'Corrigir simulados da semana' : 
                          i === 2 ? 
                          'Agendar webinar de revisão' : 
                          i === 3 ? 
                          'Atualizar cronograma de estudos' : 
                          'Revisar material de Português'
                        }
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {i === 1 ? 
                          'Hoje' : 
                          i === 2 ? 
                          'Amanhã' : 
                          i === 3 ? 
                          'Ontem' : 
                          '3 dias atrás'
                        }
                      </span>
                    </div>
                  ))}
                  
                  <Button variant="ghost" className="w-full" size="sm">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Gerenciar tarefas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Gerenciamento de Alunos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <Users className="h-16 w-16 text-secondary-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Área de Gerenciamento de Alunos</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Aqui você pode visualizar, adicionar, editar e gerenciar todos os alunos 
                  da sua instituição. Monitore o desempenho individual e crie grupos específicos.
                </p>
                <Button>Acessar Gerenciamento</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Análises e Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <BarChart2 className="h-16 w-16 text-primary-900 mb-4" />
                <h3 className="text-lg font-medium mb-2">Análises Avançadas</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Acesse relatórios detalhados sobre o desempenho dos alunos, 
                  engajamento com o conteúdo e taxas de aprovação. Exporte dados para análise externa.
                </p>
                <Button>Ver Relatórios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Materiais e Conteúdos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <BookOpen className="h-16 w-16 text-success-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Gerenciamento de Materiais</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Gerencie o conteúdo didático disponibilizado para seus alunos. 
                  Crie planos de estudo, adicione materiais e customize a experiência.
                </p>
                <Button>Gerenciar Conteúdo</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Configurações da Instituição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <Settings className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">Configurações</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Personalize a instância do Forefy para sua instituição. Defina cores, 
                  logo, configurações de acesso e outras opções.
                </p>
                <Button>Configurar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
