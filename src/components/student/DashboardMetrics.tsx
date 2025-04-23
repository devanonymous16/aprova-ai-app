
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, CalendarDays, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface RankingData {
  globalRank: number;
  totalStudents: number;
}

interface DashboardMetricsProps {
  resolvedQuestions: number;
  correctQuestions: number;
  daysPracticed: number;
  totalDays: number;
  performance: number;
  ranking: RankingData;
  timePracticedMinutes: number;
  onRankingClick: () => void;
  onTimeClick: () => void;
}

export default function DashboardMetrics({
  resolvedQuestions,
  correctQuestions,
  daysPracticed,
  totalDays,
  performance,
  ranking,
  timePracticedMinutes,
  onRankingClick,
  onTimeClick
}: DashboardMetricsProps) {
  // Helper: format minutes to hh:mm
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}min`;
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between">
          <span>Progresso Geral</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {/* Questões resolvidas */}
          <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Check className="h-5 w-5 text-violet-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Questões resolvidas</p>
              <p className="text-xl font-bold">{resolvedQuestions}</p>
              <span className="text-xs text-muted-foreground">{correctQuestions} corretas</span>
            </div>
          </div>
          {/* Dias de prática */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CalendarDays className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dias de prática</p>
              <p className="text-xl font-bold">{daysPracticed}</p>
              <span className="text-xs text-muted-foreground">{totalDays} dias totais</span>
            </div>
          </div>
          {/* Desempenho */}
          <div className="bg-green-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Desempenho</p>
              <p className="text-xl font-bold">{performance}%</p>
              <span className="text-xs text-muted-foreground">{resolvedQuestions > 0 ? Math.round((correctQuestions / resolvedQuestions) * 100) : 0}% corretas</span>
            </div>
          </div>
          {/* Ranking de acertos */}
          <Button 
            variant="outline"
            className="justify-start bg-yellow-50 hover:bg-yellow-100 border-0 rounded-lg flex items-center gap-4 p-4"
            onClick={onRankingClick}
          >
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="h-5 w-5 text-yellow-700" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Ranking de acertos</p>
              <p className="text-xl font-bold">#{ranking.globalRank} / {ranking.totalStudents}</p>
              <span className="text-xs text-muted-foreground">Melhor classificação</span>
            </div>
          </Button>
          {/* Tempo praticando */}
          <Button
            variant="outline"
            className="justify-start bg-pink-50 hover:bg-pink-100 border-0 rounded-lg flex items-center gap-4 p-4 col-span-2 md:col-span-1"
            onClick={onTimeClick}
          >
            <div className="bg-pink-100 p-3 rounded-full">
              <Clock className="h-5 w-5 text-pink-700" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Tempo praticando</p>
              <p className="text-xl font-bold">{formatTime(timePracticedMinutes)}</p>
              <span className="text-xs text-muted-foreground">Total em resolução de questões</span>
            </div>
          </Button>
        </div>
        {/* Progresso geral */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso geral</span>
            <span>{performance}% concluído</span>
          </div>
          <Progress value={performance} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
