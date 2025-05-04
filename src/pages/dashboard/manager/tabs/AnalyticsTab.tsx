// src/pages/dashboard/manager/tabs/AnalyticsTab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BarChart3, Users, ListX, ChevronDown, Users2, FlaskConical, UserMinus } from 'lucide-react'; // Ícones
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Re-adicionado se usar
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { usePerformanceByPosition } from '@/hooks/manager/usePerformanceByPosition';
import { PerformanceTopicTable } from '@/components/student/PerformanceTopicTable';
import { TopicPerformanceData } from '@/hooks/student/useStudentPerformanceData';
import { useInterventionRecommendations } from '@/hooks/manager/useInterventionRecommendations';

const AnalyticsTab: React.FC = () => {
  const { data: performanceByPosition, isLoading: isLoadingPerf, error: errorPerf } = usePerformanceByPosition();
  const { data: recommendations, isLoading: isLoadingRecs, error: errorRecs } = useInterventionRecommendations();

  // Adapter (Garantindo retorno de array e tipo correto)
  const adaptDataForTable = (topics: any[] | undefined | null): TopicPerformanceData[] => {
      if (!Array.isArray(topics)) {
          return [];
      }
      return topics.map(topic => ({
          topicId: topic.topicId ?? `unknown-${Math.random()}`,
          topicName: topic.topicName ?? 'Tópico Desconhecido',
          subjectId: topic.subjectId ?? topic.subjectName ?? 'unknown',
          subjectName: topic.subjectName ?? 'Disciplina Desconhecida',
          accuracyPercentage: topic.groupAccuracyPercentage ?? null,
          questionsAnswered: topic.questionsAnsweredCount ?? 0,
          totalStudyTimeMinutes: topic.totalStudyTimeMinutes ?? 0,
      }));
  }; // Fim da função adaptDataForTable

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performanceByPosition" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="performanceByPosition">Desempenho por Cargo</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="engagement" disabled>Engajamento</TabsTrigger>
        </TabsList>

        {/* Aba Desempenho por Cargo */}
        <TabsContent value="performanceByPosition">
          <Card>
            <CardHeader>
                <CardTitle>Análise de Desempenho por Cargo/Concurso</CardTitle>
                <CardDescription>
                    Clique em um cargo para ver o desempenho detalhado por tópico dos alunos inscritos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingPerf && ( <div className="space-y-3 p-4"><Skeleton className="h-12 w-full"/><Skeleton className="h-12 w-full"/><Skeleton className="h-12 w-full"/></div> )}
                {errorPerf && ( <div className="p-4 text-center text-red-600 bg-red-50 rounded-md"><AlertTriangle className="mx-auto h-6 w-6 mb-2"/> Erro ao carregar dados: {errorPerf.message}</div> )}
                {!isLoadingPerf && !errorPerf && performanceByPosition && performanceByPosition.length > 0 && (
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
                                        <span className='flex items-center gap-1 text-muted-foreground' title="Alunos neste cargo"><Users2 className='h-4 w-4'/> {positionData.studentCount}</span>
                                        <span className={`font-medium ${positionData.overallAccuracy && positionData.overallAccuracy < 70 ? 'text-orange-600' : 'text-green-600'}`} title="Acerto médio geral">{positionData.overallAccuracy !== null ? `${positionData.overallAccuracy}%` : '-'}</span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                                <PerformanceTopicTable data={adaptDataForTable(positionData.topics)} />
                            </AccordionContent>
                            </AccordionItem> // Fechamento AccordionItem
                        ))}
                    </Accordion> // Fechamento Accordion
                )} {/* Fechamento Condicional */}
                {!isLoadingPerf && !errorPerf && (!performanceByPosition || performanceByPosition.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">Nenhum dado de desempenho por cargo encontrado.</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Recomendações */}
        <TabsContent value="recommendations">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Coluna 1: Tópicos Críticos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"> <FlaskConical className="h-5 w-5 text-red-600" /> Tópicos de Maior Atenção </CardTitle>
                <CardDescription> Tópicos com menor percentual médio de acerto. </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecs && <div className="space-y-2"><Skeleton className="h-8 w-full"/><Skeleton className="h-8 w-full"/><Skeleton className="h-8 w-4/5"/></div>}
                {errorRecs && <p className="text-sm text-red-500 text-center">Erro ao carregar tópicos.</p>}
                {!isLoadingRecs && !errorRecs && recommendations?.criticalTopics && recommendations.criticalTopics.length > 0 && (
                  <ul className="space-y-3">
                    {recommendations.criticalTopics.slice(0, 5).map((topic) => (
                      <li key={topic.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div> <span className="font-medium">{topic.topicName}</span> <span className="block text-xs text-muted-foreground">{topic.subjectName}</span> </div>
                        <div className='text-right'>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                               <TooltipTrigger asChild>
                                  <span className={`font-semibold ${topic.averageAccuracy && topic.averageAccuracy < 60 ? 'text-red-600' : 'text-orange-600'}`}>
                                     {topic.averageAccuracy !== null ? `${topic.averageAccuracy}%` : '-'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent> <p>Acerto Médio</p> </TooltipContent>
                             </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                   <span className="ml-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                                       <Users className="h-3 w-3"/> {topic.strugglingStudentCount}
                                   </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Alunos com dificuldade (-70%)</p>
                                </TooltipContent>
                             </Tooltip>
                          </TooltipProvider>
                         </div>
                      </li> // Fechamento li
                    ))}
                  </ul> // Fechamento ul
                )} {/* Fechamento Condicional */}
                 {!isLoadingRecs && !errorRecs && (!recommendations?.criticalTopics || recommendations.criticalTopics.length === 0) && ( <p className="text-muted-foreground text-center py-4">Nenhum tópico crítico identificado.</p> )}
              </CardContent>
            </Card>

            {/* Coluna 2: Grupos por Dificuldade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"> <UserMinus className="h-5 w-5 text-orange-600" /> Grupos por Dificuldade </CardTitle>
                <CardDescription> Alunos agrupados por áreas de menor desempenho. </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecs && <div className="space-y-2"><Skeleton className="h-8 w-full"/><Skeleton className="h-8 w-full"/><Skeleton className="h-8 w-4/5"/></div>}
                {errorRecs && <p className="text-sm text-red-500 text-center">Erro ao carregar grupos.</p>}
                 {!isLoadingRecs && !errorRecs && recommendations?.studentGroupsByDifficulty && recommendations.studentGroupsByDifficulty.length > 0 && (
                   <div className="space-y-3">
                     {recommendations.studentGroupsByDifficulty.map((group) => { // <<-- Adicionado Chave aqui
                       // Lógica da Amostra Separada
                       const sampleNames = group.studentSample.map(s => s.name || 'Aluno Anônimo').slice(0, 3);
                       const sampleString = sampleNames.join(', ');
                       const ellipsis = group.studentSample.length > 3 ? '...' : '';
                       const fullSampleText = `Amostra: ${sampleString}${ellipsis}`;

                       return ( // <<-- Adicionado Return aqui
                         <div key={group.id} className="border rounded-md p-3 text-sm">
                           <div className="flex justify-between items-center mb-1"> <span className="font-semibold">{group.difficultyArea}</span> <span className="text-xs text-muted-foreground flex items-center gap-1"><Users2 className="h-3 w-3"/> {group.studentCount} Alunos</span> </div>
                           <p className='text-xs text-muted-foreground mb-2'>{fullSampleText}</p>
                           <Button size="sm" variant="outline" disabled>Ver Alunos</Button>
                         </div>
                       ); // <<-- Fechamento Return
                     })} {/* <<-- Fechamento Map */}
                   </div> // Fechamento div space-y-3
                 )} {/* Fechamento Condicional */}
                  {!isLoadingRecs && !errorRecs && (!recommendations?.studentGroupsByDifficulty || recommendations.studentGroupsByDifficulty.length === 0) && ( <p className="text-muted-foreground text-center py-4">Nenhum grupo de dificuldade identificado.</p> )}
              </CardContent>
            </Card>
          </div> {/* Fechamento div grid */}
        </TabsContent> {/* Fechamento TabsContent Recomendações */}

        {/* Aba Engajamento */}
        <TabsContent value="engagement">
             <Card>
                <CardHeader><CardTitle>Engajamento e Risco de Evasão</CardTitle></CardHeader>
                <CardContent><p className='text-center p-8 text-muted-foreground'>Placeholder para KPIs de engajamento e lista de alunos relapsos.</p></CardContent>
             </Card>
        </TabsContent>

      </Tabs> {/* Fechamento Tabs principal */}
    </div> // Fechamento div space-y-6
  ); // Fechamento return do componente
}; // Fechamento componente

export default AnalyticsTab;