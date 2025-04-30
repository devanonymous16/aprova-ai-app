import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  BarChart2,
  Award,
  Settings,
  Newspaper,
  SearchCheck
} from 'lucide-react';
// Importar o novo componente da aba de alunos
import StudentsTab from './tabs/StudentsTab'; // Ajuste o path se necessário

export default function ManagerDashboard() {
  const { profile } = useAuth();

  useEffect(() => {
    document.title = 'Forefy | Painel de Gerente';
  }, []);

  // Dados mockados para os KPIs - MANTIDOS POR ENQUANTO
  const kpiData = {
    totalStudents: 387,
    newStudents: 24,
    engagementRate: 74,
    engagementChange: 3,
    approvalRate: 68,
    approvalScope: "Últimos 4 concursos",
  };

  // TODO: Idealmente, buscar o nome da organização associada ao manager.
  // Esta busca pode ser feita no useAuth ou em um hook específico do manager.
  const getInstitutionName = () => {
    // Lógica futura: buscar em profile.organization_id -> organizations.name
    // Por enquanto, usa um fallback ou um campo inexistente (como exemplo)
    return profile?.institution_name || 'Cursinho Preparatório XYZ';
  }
  const institutionName = getInstitutionName();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Painel de Gerente</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus alunos e monitore o desempenho da sua instituição
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary-50 p-2 rounded-lg border border-secondary-100 whitespace-nowrap shrink-0">
          <div className="bg-white p-1 rounded border border-secondary-100">
            <Settings className="h-5 w-5 text-secondary-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Instituição</p>
            <p className="text-xs text-muted-foreground">{institutionName}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +{kpiData.newStudents} novos alunos este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              +{kpiData.engagementChange}% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média de Aprovação</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">{kpiData.approvalScope}</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas Principais */}
      {/* defaultValue="students" para facilitar teste inicial */}
      <Tabs defaultValue="students" className="w-full">
        {/* Lista de Abas com ajuste para overflow em telas menores */}
        <div className="overflow-x-auto pb-1 mb-6">
          <TabsList className="inline-grid w-full grid-cols-5 sm:w-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="content">Materiais</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
        </div>

        {/* --- Conteúdo das Abas --- */}

        {/* Aba: Visão Geral */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Concursos em Andamento */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Newspaper className="h-5 w-5 text-blue-600" />
                    Concursos em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-md border">
                    <p className="text-muted-foreground text-center p-4">
                      Placeholder: Cards de concursos abertos serão exibidos aqui.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita: Concursos Previstos */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                     <SearchCheck className="h-5 w-5 text-purple-600" />
                     Concursos Previstos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                        <div className="rounded-md bg-purple-50 border border-purple-100 p-2 text-purple-700 flex items-center justify-center min-w-[40px] h-10 mt-1">
                           <SearchCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            Concurso Previsto #{i} (Ex: TJSP)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Órgão Exemplo {i} - Previsão: Q{i} 2025
                          </p>
                        </div>
                      </div>
                    ))}
                     <Button variant="ghost" className="w-full mt-4" size="sm">
                       Ver todos previstos
                     </Button>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Aba: Alunos */}
        <TabsContent value="students" className="mt-0">
          {/* O conteúdo agora é renderizado pelo StudentsTab */}
          <StudentsTab />
        </TabsContent>

        {/* Aba: Análises */}
        <TabsContent value="analytics" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Análises e Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md border">
                <BarChart2 className="h-16 w-16 text-primary-900 mb-4" />
                <h3 className="text-lg font-medium mb-2">Análises Avançadas</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Placeholder: Gráficos interativos, segmentação, análise de desempenho por turma/concurso, etc.
                </p>
                <Button disabled>Ver Relatórios (Em breve)</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         {/* Aba: Materiais */}
        <TabsContent value="content" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Materiais e Conteúdos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md border">
                <BookOpen className="h-16 w-16 text-success-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Gerenciamento de Materiais</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Placeholder: Upload/organização de PDFs, vídeos, simulados, etc.
                </p>
                <Button disabled>Gerenciar Conteúdo (Em breve)</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Configurações */}
        <TabsContent value="settings" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Instituição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md border">
                <Settings className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">Configurações</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                 Placeholder: Dados da instituição, branding, integrações, gerenciamento de usuários manager.
                </p>
                <Button disabled>Configurar (Em breve)</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}