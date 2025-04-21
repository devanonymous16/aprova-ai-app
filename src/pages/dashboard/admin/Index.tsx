
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building, 
  BookOpen, 
  Settings,
  UserCheck,
  FileText,
  BarChart,
  Inbox
} from 'lucide-react';

export default function AdminDashboard() {
  useEffect(() => {
    document.title = 'Forefy | Painel Administrativo';
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold font-heading mb-6">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPI Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,231</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Instituições Parceiras
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">
              +3 novas este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Base de Questões
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,928</div>
            <p className="text-xs text-muted-foreground">
              +1,205 adicionadas este mês
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="organizations">Organizações</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                      <div className={`rounded-full p-2 ${i % 2 === 0 ? 'bg-primary-100' : 'bg-secondary-100'}`}>
                        {i % 2 === 0 ? 
                          <UserCheck className={`h-4 w-4 ${i % 2 === 0 ? 'text-primary-900' : 'text-secondary-900'}`} /> :
                          <FileText className={`h-4 w-4 ${i % 2 === 0 ? 'text-primary-900' : 'text-secondary-900'}`} />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {i % 2 === 0 ? 
                            'Novo gerente adicionado para Cursinho XYZ' : 
                            'Novo lote de questões importado com sucesso'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">Há {i * 2} horas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tarefas Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2 ${i === 1 ? 'bg-red-100' : i === 2 ? 'bg-amber-100' : 'bg-green-100'}`}>
                          {i === 1 ? 
                            <Inbox className="h-4 w-4 text-red-600" /> :
                            i === 2 ? 
                            <BarChart className="h-4 w-4 text-amber-600" /> : 
                            <Settings className="h-4 w-4 text-green-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {i === 1 ? 
                              'Revisão de nova instituição pendente' : 
                              i === 2 ? 
                              'Relatório mensal para comitê' : 
                              'Atualização de sistema planejada'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {i === 1 ? 
                              'Alta prioridade' : 
                              i === 2 ? 
                              'Prazo: 2 dias' : 
                              'Agendado para o fim de semana'
                            }
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {i === 1 ? 'Revisar' : i === 2 ? 'Preparar' : 'Configurar'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Gerais da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Gráfico de estatísticas gerais seria exibido aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <Users className="h-16 w-16 text-primary-900 mb-4" />
                <h3 className="text-lg font-medium mb-2">Área de Gerenciamento de Usuários</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Aqui você pode visualizar, adicionar, editar e desativar usuários da plataforma.
                  Gerencie estudantes, gerentes e administradores.
                </p>
                <Button>Gerenciar Usuários</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="organizations">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Gerenciamento de Organizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <Building className="h-16 w-16 text-secondary-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Área de Organizações Parceiras</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Gerencie cursinhos e instituições parceiras, configure suas instâncias
                  e monitore seus desempenhos.
                </p>
                <Button>Gerenciar Organizações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Gerenciamento de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <BookOpen className="h-16 w-16 text-success-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Área de Conteúdo</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Gerencie disciplinas, tópicos, questões e materiais de estudo disponíveis 
                  na plataforma.
                </p>
                <Button>Gerenciar Conteúdo</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
