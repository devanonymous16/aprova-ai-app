// src/components/student/dashboard/ProgressOverview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, BookCheck, CalendarDays, BarChart3, Clock } from "lucide-react"; // Ícones

// Defina um tipo para as métricas se ainda não tiver
interface Metrics {
  questionsResolved: number;
  practiceDays: { current: number; total: number };
  performance: number;
  ranking: { position: number; total: number };
  practiceTime: { hours: number; minutes: number };
}

export interface ProgressOverviewProps {
  overallProgress: number;
  metrics: Metrics;
  loading?: boolean; // Prop loading adicionada
}

export default function ProgressOverview({ overallProgress, metrics, loading }: ProgressOverviewProps) {
  const metricItems = [
    { icon: BookCheck, value: metrics.questionsResolved, label: "Questões Resolvidas" },
    { icon: CalendarDays, value: `${metrics.practiceDays.current}/${metrics.practiceDays.total}`, label: "Dias de Prática" },
    { icon: BarChart3, value: `${metrics.performance}%`, label: "Desempenho" },
    { icon: Activity, value: `#${metrics.ranking.position} de ${metrics.ranking.total}`, label: "Ranking de Acertos" },
    { icon: Clock, value: `${metrics.practiceTime.hours}h ${metrics.practiceTime.minutes}m`, label: "Tempo Praticando" },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-lg">
                  <div className="h-6 w-6 bg-gray-300 rounded-full mb-2"></div>
                  <div className="h-5 bg-gray-300 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (metrics.questionsResolved === 0 && overallProgress === 0) {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Você ainda não iniciou seus estudos para este concurso. Que tal começar agora?</p>
            </CardContent>
         </Card>
    )
  }


  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Progresso Geral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-primary">Progresso geral</span>
            <span className="text-sm font-medium text-primary">{overallProgress}% concluído</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
          {metricItems.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <item.icon className="h-6 w-6 mx-auto text-primary mb-2" />
              <div className="text-xl font-semibold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}