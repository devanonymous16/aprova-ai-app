// src/components/admin/dashboard/EvolutionChart.tsx
// import React from 'react'; // Removido 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton'; // Skeleton está sendo usado
import { QuestionEvolutionData as AdminQuestionEvolutionData } from '@/lib/adminQueries';

interface EvolutionChartProps {
  data: AdminQuestionEvolutionData[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export default function EvolutionChart({ data, isLoading, error }: EvolutionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Total de Questões</CardTitle>
          <CardDescription>Carregando dados da evolução...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Total de Questões</CardTitle>
          <CardDescription className="text-red-500">Erro ao carregar dados da evolução.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Não foi possível buscar os dados. Tente novamente mais tarde.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Total de Questões</CardTitle>
          <CardDescription>Ainda não há dados suficientes para exibir a evolução.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Assim que houver registros de questões, o gráfico aparecerá aqui.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Cumulativa de Questões Ativas</CardTitle>
        <CardDescription>Total de questões na base ao longo do tempo (pontos às 06h e 18h).</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label_eixo_x" 
              angle={-45}
              textAnchor="end" 
              height={70} 
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }} 
            />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value: number /*, name: string, props: any */) => [value.toLocaleString('pt-BR'), "Total de Questões"]} // Removido _name e _props se não usados
              labelFormatter={(label: string, payload: any[]) => {
                if (payload && payload.length > 0 && payload[0].payload.dia_turno) {
                  return `Data: ${new Date(payload[0].payload.dia_turno).toLocaleString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}`;
                }
                return label;
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="quantidade_cumulativa" 
              stroke="#1D3557" 
              strokeWidth={2} 
              activeDot={{ r: 6 }} 
              name="Total Cumulativo"
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}