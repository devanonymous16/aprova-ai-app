import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Mantido para placeholders
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext'; // Mantido
import {
  Users,
  BookOpen,
  BarChart2,
  // Clipboard, // Removido - Tarefas
  // Calendar, // Removido - Eventos
  // MessageSquare, // Removido - Mensagens
  Award,
  Settings,
  Newspaper, // Ícone para Concursos em Andamento
  SearchCheck // Ícone para Concursos Previstos
} from 'lucide-react'; // Ícones ajustados

export default function ManagerDashboard() {
  // const { user } = useAuth(); // user não é usado diretamente aqui, comentado por enquanto
  const { profile } = useAuth(); // profile usado no header

  useEffect(() => {
    document.title = 'Forefy | Painel de Gerente';
  }, []);

  // Dados mockados para os KPIs - MANTIDOS POR ENQUANTO
  // TODO: Substituir por dados reais vindos de hooks específicos do Manager
  const kpiData = {
    totalStudents: 387,
    newStudents: 24,
    engagementRate: 74,
    engagementChange: 3,
    approvalRate: 68,
    approvalScope: "Últimos 4 concursos",
  };
  // Nome da instituição (Poderia vir do profile do manager ou de um contexto de organização)
  const institutionName = profile?.institution_name || 'Cursinho Preparatório XYZ'; // Exemplo

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Painel de Gerente</h1>
          <p className="text-muted-foreground">
            Gerencie seus alunos e monitore o desempenho da sua instituição
          </p>
        </div>
        {/* Exibição da Instituição - Usando nome do profile ou mock */}
        <div className="hidden md:flex items-center gap-2 bg-secondary-50 p-2 rounded-lg border border-secondary-100">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      <Tabs defaultValue="overview" className="w-full">
        {/* Lista de Abas */}
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="content">Materiais</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Conteúdo da Aba: Visão Geral */}
        <TabsContent value="overview" className="mt-0"> {/* Removido mt-6 daqui */}
          {/* Grid Principal da Visão Geral */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda (Maior) - Concursos em Andamento */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  {/* Título da Nova Seção */}
                  <CardTitle>Concursos em Andamento</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                   {/* Placeholder para os Cards de Concurso */}
                   <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-md">
                    <p className="text-muted-foreground text-center p-4">
                      Placeholder: Cards de concursos abertos (com paginação e filtros) serão exibidos aqui.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita (Menor) - Concursos Previstos */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                   {/* Título da Nova Seção */}
                  <CardTitle>Concursos Previstos</CardTitle>
                </CardHeader>
                <CardContent>
                   {/* Placeholder - Layout similar ao de 'Próximos Eventos' */}
                   <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => ( // Adicionei mais um item para preencher
                      <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                        <div className="rounded-md bg-blue-50 border border-blue-100 p-2 text-blue-900 flex items-center justify-center min-w-[48px] h-12">
                           {/* Ícone placeholder */}
                           <SearchCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            Concurso Previsto #{i} (Ex: INSS)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Órgão Exemplo {i} - Previsão: Q{i} 2025
                          </p>
                        </div>
                      </div>
                    ))}
                     <Button variant="ghost" className="w-full" size="sm">
                       {/* <Calendar className="h-4 w-4 mr-2" /> */}
                       Ver todos previstos
                     </Button>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>

           {/* Seções REMOVIDAS de Mensagens e Tarefas que estavam aqui */}

        </TabsContent>

        {/* Conteúdo da Aba: Alunos */}
        <TabsContent value="students" className="mt-0">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Gerenciamento de Alunos</CardTitle>
            </CardHeader>
            <CardContent>
               {/* Placeholder para Tabela Interativa de Alunos */}
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <Users className="h-16 w-16 text-secondary-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Área de Gerenciamento de Alunos</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Placeholder: Tabela interativa, filtros, busca, modal de detalhes e gráficos serão implementados aqui.
                </p>
                <Button disabled>Acessar Gerenciamento (Em breve)</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo da Aba: Análises */}
        <TabsContent value="analytics" className="mt-0">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Análises e Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <BarChart2 className="h-16 w-16 text-primary-900 mb-4" />
                <h3 className="text-lg font-medium mb-2">Análises Avançadas</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Placeholder: Mapa de calor, análise de bancas, segmentação, ROI, etc., serão implementados aqui.
                </p>
                <Button disabled>Ver Relatórios (Em breve)</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         {/* Conteúdo da Aba: Materiais */}
        <TabsContent value="content" className="mt-0">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Materiais e Conteúdos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <BookOpen className="h-16 w-16 text-success-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Gerenciamento de Materiais</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Placeholder: Funcionalidades para gerenciar conteúdo didático.
                </p>
                <Button disabled>Gerenciar Conteúdo (Em breve)</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo da Aba: Configurações */}
        <TabsContent value="settings" className="mt-0">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Configurações da Instituição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                <Settings className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">Configurações</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                 Placeholder: Opções para personalizar a plataforma.
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
