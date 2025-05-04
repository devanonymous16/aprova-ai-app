// src/pages/dashboard/manager/tabs/AnalyticsTab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BarChart3, TrendingUp, Users, ListX, Award, ChevronDown, Activity, Users2 } from 'lucide-react'; // Adiciona/Ajusta Ícones
// import { useOrganizationMetrics } from '@/hooks/manager/useOrganizationMetrics'; // Não usado aqui
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"; // Importa Accordion
import { usePerformanceByPosition } from '@/hooks/manager/usePerformanceByPosition'; // Importa novo hook
// Importa a tabela que já fizemos (ajustar o tipo de dados que ela recebe)
import { PerformanceTopicTable } from '@/components/student/PerformanceTopicTable';
// Importa o tipo necessário para a tabela de tópicos
import { TopicPerformanceData } from '@/hooks/student/useStudentPerformanceData';


const AnalyticsTab: React.FC = () => {
  // Hook para buscar dados por cargo
  const { data: performanceByPosition, isLoading, error } = usePerformanceByPosition();

  // Adapta os dados agregados por posição para o formato esperado pela PerformanceTopicTable
  // (Isso é temporário, idealmente a tabela aceitaria o tipo agregado diretamente)
  const adaptDataForTable = (topics: any[]): TopicPerformanceData[] => {
      return topics.map(topic => ({
          topicId: topic.topicId,
          topicName: topic.topicName,
          subjectId: topic.subjectId || topic.subjectName, // Adapta se não tiver ID separado
          subjectName: topic.subjectName,
          accuracyPercentage: topic.groupAccuracyPercentage, // Usa a acurácia do grupo
          questionsAnswered: topic.questionsAnsweredCount, // Usa a contagem de questões
          totalStudyTimeMinutes: 0, // Mock ou calcular se tiver dados
      }));
  };

  return (
    <div className="space-y-6"> {/* Removido mt-6 daqui */}
      {/* Abas para Análises Detalhadas */}
      <Tabs defaultValue="performanceByPosition" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="performanceByPosition">Desempenho por Cargo</TabsTrigger>
          <TabsTrigger value="recommendations" disabled>Recomendações</TabsTrigger>
          <TabsTrigger value="engagement" disabled>Engajamento</TabsTrigger>
        </TabsList>

        {/* Conteúdo da Aba: Desempenho por Cargo */}
        <TabsContent value="performanceByPosition">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Desempenho por Cargo/Concurso</CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Clique em um cargo para ver o desempenho detalhado por tópico dos alunos inscritos.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading && (
                  <div className="space-y-3 p-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                  </div>
              )}
              {error && (
                  <div className="p-4 text-center text-red-600 bg-red-50 rounded-md">
                      <AlertTriangle className="mx-auto h-6 w-6 mb-2"/> Erro ao carregar dados: {error.message}
                  </div>
              )}
              {!isLoading && !error && performanceByPosition && performanceByPosition.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  {performanceByPosition.map((positionData) => (
                    <AccordionItem value={positionData.positionId} key={positionData.positionId}>
                      <AccordionTrigger className="hover:bg-gray-50 px-4">
                         <div className='flex justify-between items-center w-full pr-4'>
                             <div className='text-left'>
                                 <p className='font-semibold text-base'>{positionData.positionName}</p>
                                 <p className='text-xs text-muted-foreground'>{positionData.examName}</p>
                             </div>
                             <div className='flex items-center gap-4 text-sm text-right'>
                                  <span className='flex items-center gap-1 text-muted-foreground' title="Alunos neste cargo">
                                      <Users2 className='h-4 w-4'/> {positionData.studentCount}
                                  </span>
                                  <span className={`font-medium ${positionData.overallAccuracy && positionData.overallAccuracy < 70 ? 'text-orange-600' : 'text-green-600'}`} title="Acerto médio geral">
                                      {positionData.overallAccuracy !== null ? `${positionData.overallAccuracy}%` : '-'}
                                  </span>
                             </div>
                         </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        {/* Renderiza a tabela de tópicos para este cargo */}
                        {/* Precisamos adaptar os dados mockados agregados para o formato que a tabela espera */}
                        <PerformanceTopicTable data={adaptDataForTable(positionData.topics)} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
               {!isLoading && !error && (!performanceByPosition || performanceByPosition.length === 0) && (
                   <p className="text-muted-foreground text-center py-8">Nenhum dado de desempenho por cargo encontrado para esta organização.</p>
               )}
            </CardContent>
          </Card>
        </TabsContent>

         {/* Outras Abas */}
         <TabsContent value="recommendations"> {/* ... Placeholder ... */} </TabsContent>
         <TabsContent value="engagement"> {/* ... Placeholder ... */} </TabsContent>

      </Tabs>
    </div>
  );
};

export default AnalyticsTab;