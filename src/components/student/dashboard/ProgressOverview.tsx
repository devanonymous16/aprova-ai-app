
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, BarChart2, AlertTriangle, TrendingUp } from 'lucide-react';

interface ProgressOverviewProps {
  overallProgress: number;
  examCount: number;
}

export default function ProgressOverview({ overallProgress, examCount }: ProgressOverviewProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concursos ativos</p>
              <p className="text-xl font-bold">{examCount}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart2 className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média de desempenho</p>
              <p className="text-xl font-bold">68%</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tópicos críticos</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </div>
        </div>
        
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
