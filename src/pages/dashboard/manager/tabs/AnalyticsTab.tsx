// src/pages/dashboard/manager/tabs/AnalyticsTab.tsx
import React from 'react'; // Import React
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BarChart3, Users, ListX, Users2, FlaskConical, UserMinus, Clock, Activity, Eye } from 'lucide-react'; // Ícones Necessários
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress'; // Não usado nesta versão
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Importa Tabela
import { Badge } from "@/components/ui/badge"; // Importa Badge

import { usePerformanceByPosition } from '@/hooks/manager/usePerformanceByPosition';
import { PerformanceTopicTable } from '@/components/student/PerformanceTopicTable';
import { TopicPerformanceData } from '@/hooks/student/useStudentPerformanceData';
import { useInterventionRecommendations } from '@/hooks/manager/useInterventionRecommendations';
import { useEngagementRiskData, EngagementRiskData } from '@/hooks/manager/useEngagementRiskData'; // Importa tipo

// Helper Pluralize (CORRIGIDO)
const pluralize = (count: number | null | undefined, singular: string, plural: string): string => {
    if (count === null || count === undefined) {
       return `- ${plural}`;
    }
    if (count === 1) {
        return `${count} ${singular}`;
    }
    return `${count} ${plural}`;
}; // <<-- Fechamento com PONTO E VÍRGULA

// Adapter (CORRIGIDO)
const adaptDataForTable = (topics: any[] | undefined | null): TopicPerformanceData[] => {
    if (!Array.isArray(topics)) {
        return [];
    }
    return topics.map(topic => ({
        topicId: String(topic.topicId ?? `unknown-${Math.random()}`),
        topicName: String(topic.topicName ?? 'Tópico Desconhecido'),
        subjectId: String(topic.subjectId ?? topic.subjectName ?? 'unknown'),
        subjectName: String(topic.subjectName ?? 'Disciplina Desconhecida'),
        accuracyPercentage: topic.groupAccuracyPercentage ?? null,
        questionsAnswered: topic.questionsAnswered ?? 0,
        totalStudyTimeMinutes: topic.totalStudyTimeMinutes ?? 0,
    }));
}; // <<-- Fechamento com PONTO E VÍRGULA


const AnalyticsTab: React.FC = () => {
  // Hooks
  const { data: performanceByPosition, isLoading: isLoadingPerf, error: errorPerf } = usePerformanceByPosition();
  const { data: recommendations, isLoading: isLoadingRecs, error: errorRecs } = useInterventionRecommendations();
  const { data: engagementData, isLoading: isLoadingEng, error: errorEng } = useEngagementRiskData(); // <<< Chamada correta

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performanceByPosition" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="performanceByPosition">Desempenho por Cargo</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
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
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
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
                                  <span className={`font-semibold ${topic.averageAccuracy && topic.averageAccuracy < 60 ? 'text-red-600' : 'text-orange-600'}`}> {topic.averageAccuracy !== null ? `${topic.averageAccuracy}%` : '-'} </span>
                                </TooltipTrigger>
                                <TooltipContent> <p>Acerto Médio</p> </TooltipContent>
                             </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                   <span className="ml-2 text-xs text-muted-foreground inline-flex items-center gap-1"> <Users className="h-3 w-3"/> {topic.strugglingStudentCount} </span>
                                </TooltipTrigger>
                                <TooltipContent> <p>Alunos com dificuldade (-70%)</p> </TooltipContent>
                             </Tooltip>
                          </TooltipProvider>
                         </div>
                      </li>
                    ))}
                  </ul>
                )}
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
                     {recommendations.studentGroupsByDifficulty.map((group) => {
                       const sampleNames = group.studentSample.map(s => s.name || 'Aluno Anônimo').slice(0, 3);
                       const sampleString = sampleNames.join(', ');
                       const ellipsis = group.studentSample.length > 3 ? '...' : '';
                       const fullSampleText = `Amostra: ${sampleString}${ellipsis}`;

                       return (
                         <div key={group.id} className="border rounded-md p-3 text-sm">
                           <div className="flex justify-between items-center mb-1"> <span className="font-semibold">{group.difficultyArea}</span> <span className="text-xs text-muted-foreground flex items-center gap-1"><Users2 className="h-3 w-3"/> {group.studentCount} Alunos</span> </div>
                           <p className='text-xs text-muted-foreground mb-2'>{fullSampleText}</p>
                           <Button size="sm" variant="outline" disabled>Ver Alunos</Button>
                         </div>
                       ); // Fechamento Return
                     })} {/* Fechamento Map */}
                   </div> // Fechamento div space-y-3
                 )} {/* Fechamento Condicional */}
                  {!isLoadingRecs && !errorRecs && (!recommendations?.studentGroupsByDifficulty || recommendations.studentGroupsByDifficulty.length === 0) && ( <p className="text-muted-foreground text-center py-4">Nenhum grupo de dificuldade identificado.</p> )}
              </CardContent>
            </Card>
          </div> {/* Fechamento div grid */}
        </TabsContent> {/* Fechamento TabsContent Recomendações */}

        {/* Aba Engajamento */}
        <TabsContent value="engagement">
             <div className="space-y-6">
                {/* KPIs de Engajamento */}
                 <div className="grid gap-4 md:grid-cols-2">
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Atividade Semanal</CardTitle> <Activity className="h-4 w-4 text-muted-foreground" /> </CardHeader>
                         <CardContent>
                             {isLoadingEng ? <Skeleton className="h-8 w-20 mt-1"/> : errorEng ? <span className='text-xs text-red-500'>Erro</span> : <div className="text-2xl font-bold text-green-600">{engagementData?.engagementKPIs?.weeklyActivePercent ?? '-'}%</div>}
                             {!isLoadingEng && !errorEng && <p className="text-xs text-muted-foreground pt-1">% de alunos que acessaram nos últimos 7 dias.</p>}
                         </CardContent>
                     </Card>
                      <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Tempo Médio/Sessão</CardTitle> <Clock className="h-4 w-4 text-muted-foreground" /> </CardHeader>
                         <CardContent>
                              {isLoadingEng ? <Skeleton className="h-8 w-20 mt-1"/> : errorEng ? <span className='text-xs text-red-500'>Erro</span> : <div className="text-2xl font-bold">{engagementData?.engagementKPIs?.averageSessionMinutes ?? '-'} min</div>}
                             {!isLoadingEng && !errorEng && <p className="text-xs text-muted-foreground pt-1">Duração média das sessões de estudo.</p>}
                         </CardContent>
                     </Card>
                 </div>

                 {/* Tabela de Alunos em Risco */}
                 <Card>
                     <CardHeader>
                         <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500"/> Alunos com Baixo Engajamento/Risco</CardTitle>
                         <CardDescription>Alunos que podem precisar de atenção devido à baixa atividade recente.</CardDescription>
                     </CardHeader>
                     <CardContent>
                         {isLoadingEng && <div className="space-y-2"><Skeleton className="h-10 w-full"/><Skeleton className="h-10 w-full"/><Skeleton className="h-10 w-4/5"/></div>}
                         {errorEng && <p className="text-sm text-red-500 text-center py-4">Erro ao carregar lista de alunos.</p>}
                         {!isLoadingEng && !errorEng && engagementData?.riskyStudents && engagementData.riskyStudents.length > 0 && (
                             <Table>
                                 <TableHeader> <TableRow> <TableHead>Aluno</TableHead> <TableHead className='text-center'>Último Acesso</TableHead> <TableHead className='text-center'>Tempo (Últ. 7d)</TableHead> <TableHead>Motivo do Alerta</TableHead> <TableHead className="text-right">Ações</TableHead> </TableRow> </TableHeader>
                                 <TableBody>
                                     {engagementData.riskyStudents.map((student) => (
                                         <TableRow key={student.studentId}>
                                             <TableCell className="font-medium">{student.studentName ?? 'Aluno Anônimo'}</TableCell>
                                             <TableCell className='text-center text-muted-foreground text-sm'>{pluralize(student.lastLoginDaysAgo, 'dia', 'dias')} atrás</TableCell>
                                             <TableCell className='text-center text-muted-foreground text-sm'>{student.timeSpentLastWeek !== null ? `${student.timeSpentLastWeek} min` : '-'}</TableCell>
                                             <TableCell>
                                                 <Badge
                                                    variant={student.warningReason === 'Inativo' ? 'destructive' : 'outline'}
                                                    className={`text-xs ${
                                                        student.warningReason === 'Baixo Uso' ? 'text-orange-700 border-orange-400 bg-orange-50' :
                                                        student.warningReason === 'Desempenho em Queda' ? 'text-yellow-700 border-yellow-400 bg-yellow-50' : ''
                                                        // Adiciona um fallback ou deixa sem cor extra se for 'Outro'
                                                    }`}
                                                  >
                                                     {student.warningReason}
                                                 </Badge>
                                             </TableCell>
                                             <TableCell className="text-right"> <Button variant="ghost" size="sm" className="text-xs" disabled> <Eye className="h-3.5 w-3.5 mr-1"/> Ver Perfil </Button> </TableCell>
                                         </TableRow>
                                     ))}
                                 </TableBody>
                             </Table>
                         )}
                          {!isLoadingEng && !errorEng && (!engagementData?.riskyStudents || engagementData.riskyStudents.length === 0) && (
                             <p className="text-muted-foreground text-center py-8">Nenhum aluno em risco identificado.</p>
                          )}
                     </CardContent>
                 </Card>
             </div>
           </TabsContent> {/* Fim TabsContent Engajamento */}

      </Tabs> {/* Fim Tabs Principal */}
    </div> // Fim Div Principal
  ); // Fim Return
}; // Fim Componente

export default AnalyticsTab;