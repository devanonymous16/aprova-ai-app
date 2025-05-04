// src/pages/dashboard/manager/tabs/AnalyticsTab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BarChart3, Users, ListX, Users2, FlaskConical, UserMinus, Clock, Activity, Eye } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { usePerformanceByPosition } from '@/hooks/manager/usePerformanceByPosition';
import { PerformanceTopicTable } from '@/components/student/PerformanceTopicTable';
import { TopicPerformanceData } from '@/hooks/student/useStudentPerformanceData';
import { useInterventionRecommendations } from '@/hooks/manager/useInterventionRecommendations';
import { useEngagementRiskData, EngagementRiskData } from '@/hooks/manager/useEngagementRiskData'; // Importa tipo

// Helper Pluralize (CORRIGIDO NOVAMENTE)
const pluralize = (count: number | null | undefined, singular: string, plural: string): string => {
    // Verifica explicitamente null e undefined antes de verificar o número
    if (count === null || count === undefined) {
       return `- ${plural}`;
    }
    if (count === 1) {
        return `${count} ${singular}`;
    }
    // Todos os outros casos (0, 2, 3...) retornam plural
    return `${count} ${plural}`;
};

// Adapter (CORRIGIDO NOVAMENTE)
const adaptDataForTable = (topics: any[] | undefined | null): TopicPerformanceData[] => {
    if (!Array.isArray(topics)) {
        return [];
    }
    // Retorna explicitamente o array mapeado
    return topics.map(topic => ({
        topicId: String(topic.topicId ?? `unknown-${Math.random()}`), // Garante string
        topicName: String(topic.topicName ?? 'Tópico Desconhecido'),
        subjectId: String(topic.subjectId ?? topic.subjectName ?? 'unknown'),
        subjectName: String(topic.subjectName ?? 'Disciplina Desconhecida'),
        accuracyPercentage: topic.groupAccuracyPercentage ?? null,
        questionsAnswered: topic.questionsAnswered ?? 0,
        totalStudyTimeMinutes: topic.totalStudyTimeMinutes ?? 0,
    }));
};


const AnalyticsTab: React.FC = () => {
  // Hooks (Chamadas padrão com desestruturação)
  const { data: performanceByPosition, isLoading: isLoadingPerf, error: errorPerf } = usePerformanceByPosition();
  const { data: recommendations, isLoading: isLoadingRecs, error: errorRecs } = useInterventionRecommendations();
  // Tenta desestruturar novamente, garantindo que o hook useEngagementRiskData tem tipo de retorno correto
  const { data: engagementData, isLoading: isLoadingEng, error: errorEng } = useEngagementRiskData();


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
           {/* ... Conteúdo ... */}
        </TabsContent>

        {/* Aba Recomendações */}
        <TabsContent value="recommendations">
            {/* ... Conteúdo ... */}
        </TabsContent>

        {/* Aba Engajamento */}
        <TabsContent value="engagement">
          <div className="space-y-6">
            {/* KPIs de Engajamento */}
             <div className="grid gap-4 md:grid-cols-2">
                {/* ... Cards ... */}
             </div>

             {/* Tabela de Alunos em Risco */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500"/> Alunos com Baixo Engajamento/Risco</CardTitle>
                    <CardDescription>Alunos que podem precisar de atenção devido à baixa atividade recente.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* ... Loading / Error states ... */}
                    {!isLoadingEng && !errorEng && engagementData?.riskyStudents && engagementData.riskyStudents.length > 0 && (
                        <Table>
                           {/* ... TableHeader ... */}
                            <TableBody>
                                {engagementData.riskyStudents.map((student) => (
                                    <TableRow key={student.studentId}>
                                        <TableCell className="font-medium">{student.studentName ?? 'Aluno Anônimo'}</TableCell>
                                        <TableCell className='text-center text-muted-foreground text-sm'>{pluralize(student.lastLoginDaysAgo, 'dia', 'dias')} atrás</TableCell>
                                        <TableCell className='text-center text-muted-foreground text-sm'>{student.timeSpentLastWeek !== null ? `${student.timeSpentLastWeek} min` : '-'}</TableCell>
                                        <TableCell>
                                            {/* Badge CORRIGIDO */}
                                            <Badge
                                                variant={student.warningReason === 'Inativo' ? 'destructive' : 'outline'}
                                                className={`text-xs ${
                                                    student.warningReason === 'Baixo Uso' ? 'text-orange-700 border-orange-400 bg-orange-50' :
                                                    student.warningReason === 'Desempenho em Queda' ? 'text-yellow-700 border-yellow-400 bg-yellow-50' : ''
                                                    // Adicione um fallback ou deixe sem cor extra se for 'Outro'
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
                    {/* ... No data state ... */}
                </CardContent>
             </Card>
          </div>
        </TabsContent> {/* Fim TabsContent Engajamento */}
      </Tabs> {/* Fim Tabs Principal */}
    </div> // Fim Div Principal
  ); // Fim Return
}; // Fim Componente

export default AnalyticsTab;