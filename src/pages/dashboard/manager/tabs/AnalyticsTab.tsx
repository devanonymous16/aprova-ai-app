// src/pages/dashboard/manager/tabs/AnalyticsTab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from 'lucide-react'; // Ícone exemplo

// Remover import e uso de useOrganizationMetrics daqui, pois KPIs estão no Index

const AnalyticsTab: React.FC = () => {
  // Remover chamada de hook useOrganizationMetrics
  // const { data: metrics, isLoading, error } = useOrganizationMetrics();

  return (
    // Mantém um div wrapper se necessário, ou começa direto com Tabs
    <div className="space-y-6">
        {/* KPIs gerais foram movidos para ManagerDashboard/Index.tsx */}

        {/* Abas para Análises Detalhadas */}
        <Tabs defaultValue="performanceByPosition" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="performanceByPosition">Desempenho por Cargo</TabsTrigger>
                <TabsTrigger value="recommendations">Recomendações</TabsTrigger> {/* Habilitar quando implementar */}
                <TabsTrigger value="engagement">Engajamento</TabsTrigger> {/* Habilitar quando implementar */}
            </TabsList>

            {/* Conteúdo da Aba: Desempenho por Cargo */}
            <TabsContent value="performanceByPosition">
            <Card>
                <CardHeader>
                    <CardTitle>Análise de Desempenho por Cargo/Concurso</CardTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                        Visualize o desempenho agregado dos alunos agrupados pelo cargo que estão se preparando.
                    </p>
                </CardHeader>
                <CardContent>
                    {/* TODO: Implementar Fase 2 (Accordion com cargos e tabela de tópicos) aqui */}
                    <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md border min-h-[300px]">
                        <BarChart3 className="h-16 w-16 text-primary-900 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Em Breve</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Lista de cargos/concursos com desempenho detalhado por tópico será exibida aqui.
                        </p>
                    </div>
                </CardContent>
            </Card>
            </TabsContent>

            {/* Conteúdo das outras abas */}
            <TabsContent value="recommendations">
                 <Card>
                    <CardHeader><CardTitle>Recomendações e Intervenções</CardTitle></CardHeader>
                    <CardContent><p className='text-center p-8 text-muted-foreground'>Placeholder para Tópicos Críticos e Grupos de Risco.</p></CardContent>
                 </Card>
            </TabsContent>
            <TabsContent value="engagement">
                 <Card>
                    <CardHeader><CardTitle>Engajamento e Risco de Evasão</CardTitle></CardHeader>
                    <CardContent><p className='text-center p-8 text-muted-foreground'>Placeholder para KPIs de engajamento e lista de alunos relapsos.</p></CardContent>
                 </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default AnalyticsTab;