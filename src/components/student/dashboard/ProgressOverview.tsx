
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, CalendarDays, TrendingUp, Award, Timer } from 'lucide-react';

interface ProgressOverviewProps {
  overallProgress: number;
  metrics: {
    questionsResolved: number;
    practiceDays: { current: number; total: number };
    performance: number;
    ranking: { position: number; total: number };
    practiceTime: { hours: number; minutes: number };
  };
}

export default function ProgressOverview({ overallProgress, metrics }: ProgressOverviewProps) {
  const [expandedCard, setExpandedCard] = useState<'ranking' | 'time' | null>(null);

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between">
          <span>Progresso Geral</span>
          {overallProgress > 30 && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bom progresso
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Check className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Questões Resolvidas</p>
              <p className="text-xl font-bold">{metrics.questionsResolved}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <CalendarDays className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dias de Prática</p>
              <p className="text-xl font-bold">{metrics.practiceDays.current} / {metrics.practiceDays.total}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Desempenho</p>
              <p className="text-xl font-bold">{metrics.performance}%</p>
            </div>
          </div>
          
          <button 
            onClick={() => setExpandedCard(expandedCard === 'ranking' ? null : 'ranking')}
            className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors"
          >
            <div className="bg-amber-100 p-3 rounded-full">
              <Award className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground text-left">Ranking de Acertos</p>
              <p className="text-xl font-bold">#{metrics.ranking.position} de {metrics.ranking.total}</p>
            </div>
          </button>
          
          <button 
            onClick={() => setExpandedCard(expandedCard === 'time' ? null : 'time')}
            className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors"
          >
            <div className="bg-cyan-100 p-3 rounded-full">
              <Timer className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground text-left">Tempo Praticando</p>
              <p className="text-xl font-bold">{metrics.practiceTime.hours}h {metrics.practiceTime.minutes}m</p>
            </div>
          </button>
        </div>
        
        {expandedCard === 'ranking' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">
              Placeholder: Aqui aparecerá o ranking detalhado por Tópicos.
            </p>
          </div>
        )}
        
        {expandedCard === 'time' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">
              Placeholder: Aqui aparecerá o tempo detalhado por Tópicos.
            </p>
          </div>
        )}
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso geral</span>
            <span>{Math.round(overallProgress)}% concluído</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
