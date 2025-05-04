// src/pages/dashboard/manager/Index.tsx
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton'; // Para loading dos KPIs
import {
  Users, BookOpen, BarChart3, Award, Settings, Newspaper, SearchCheck, TrendingUp, ListX, LineChart // Adicionados ícones para KPIs
} from 'lucide-react';
// Hook para buscar métricas gerais (mesmo que mockado)
import { useOrganizationMetrics } from '@/hooks/manager/useOrganizationMetrics'; // Importa o hook de métricas
import StudentsTab from './tabs/StudentsTab';
import AnalyticsTab from './tabs/AnalyticsTab'; // Mantemos a importação, mas o conteúdo vai mudar

// Helper para renderizar KPI Card (movido para cá ou pode ir para um utils)
const renderKPICard = (title: string, value: number | string | null, isLoading: boolean, error: Error | null, icon: React.ElementType, unit: string = "", description?: string, valueColor?: string) => {
    const Icon = icon;
    const displayValue = value !== null && value !== undefined ? `${value}${unit}` : '-';
    const colorClass = valueColor || 'text-gray-900 dark:text-gray-100';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" /> // Ajustado tamanho do skeleton
                ) : error ? (
                     <span className='text-xs text-red-500 truncate' title={error.message}>Erro</span> // Mostra erro tooltip
                ): (
                    <div className={`text-2xl font-bold ${colorClass}`}>{displayValue}</div>
                )}
                 {description && !isLoading && !error && (
                     <p className="text-xs text-muted-foreground pt-1">{description}</p>
                 )}
                  {isLoading && <Skeleton className="h-3 w-4/5 mt-1.5" />} {/* Skeleton para descrição */}
            </CardContent>
        </Card>
    );
}

export default function ManagerDashboard() {
  useEffect(() => {
    document.title = 'Forefy | Painel de Gerente';
  }, []);

  // Busca as métricas gerais da organização
  const { data: metrics, isLoading: isLoadingMetrics, error: errorMetrics } = useOrganizationMetrics();

  // Dados mockados antigos para Total de Alunos (manter por enquanto)
  const kpiData = { totalStudents: 387, newStudents: 24 };

  const institutionName = 'Cursinho Preparatório XYZ'; // Placeholder

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabeçalho da Página - RESTAURADO/GARANTIDO */}
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

      {/* KPIs Principais - RESTAURADOS AQUI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Alunos (ainda do mock antigo) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Alunos</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{kpiData.totalStudents}</div><p className="text-xs text-muted-foreground">+{kpiData.newStudents} novos este mês</p></CardContent>
          </Card>
          {/* Outros KPIs do hook useOrganizationMetrics */}
          {renderKPICard("Taxa de Aprovação", metrics?.approvalRate, isLoadingMetrics, errorMetrics, Award, "%", "Média geral histórica", "text-green-600")}
          {renderKPICard("Engajamento Semanal", metrics?.engagementRate, isLoadingMetrics, errorMetrics, TrendingUp, "%", "Alunos ativos últimos 7 dias")}
          {renderKPICard("Tópicos Críticos", metrics?.criticalTopicsCount, isLoadingMetrics, errorMetrics, ListX, "", "Com menor desempenho médio", "text-red-600")}
      </div>

      {/* Abas Principais */}
      {/* Default volta para 'overview' ou 'students' */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-1 mb-6">
          <TabsList className="inline-grid w-full grid-cols-3 sm:grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="analytics">Desempenho & Insights</TabsTrigger> {/* Nome Atualizado */}
            <TabsTrigger value="content">Materiais</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
        </div>

        {/* Conteúdo das Abas */}

        {/* Aba: Visão Geral - RESTAURADA */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Concursos em Andamento */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"> <Newspaper className="h-5 w-5 text-blue-600" /> Concursos em Andamento </CardTitle>
                </CardHeader>
                <CardContent> <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-md border"> <p className="text-muted-foreground text-center p-4"> Placeholder: Cards de concursos abertos... </p> </div> </CardContent>
              </Card>
            </div>
            {/* Coluna Direita: Concursos Previstos */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader> <CardTitle className="flex items-center gap-2 text-lg"> <SearchCheck className="h-5 w-5 text-purple-600" /> Concursos Previstos </CardTitle> </CardHeader>
                <CardContent> <div className="space-y-4"> {/* ... (Loop de concursos previstos mockados) ... */} </div> </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Aba: Alunos */}
        <TabsContent value="students" className="mt-0">
          <StudentsTab />
        </TabsContent>

        {/* Aba: Desempenho & Insights */}
        <TabsContent value="analytics" className="mt-0">
          {/* O conteúdo detalhado virá do AnalyticsTab */}
          <AnalyticsTab />
        </TabsContent>

        {/* Aba: Materiais */}
        <TabsContent value="content" className="mt-0">
           <Card className="mt-6"> {/* Adicionado mt-6 */} {/* ... (Placeholder Materiais) ... */} </Card>
        </TabsContent>

        {/* Aba: Configurações */}
        <TabsContent value="settings" className="mt-0">
            <Card className="mt-6"> {/* Adicionado mt-6 */} {/* ... (Placeholder Configurações) ... */} </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}