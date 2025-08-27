import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QuestionsBySubjectData } from '@/lib/adminQueries';

interface SubjectBarChartProps {
  data?: QuestionsBySubjectData[];
  isLoading: boolean;
  error?: Error | null;
  maxItems?: number;
}

const SubjectBarChart: React.FC<SubjectBarChartProps> = ({ 
  data, 
  isLoading, 
  error, 
  maxItems = 10 
}) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-red-500">Erro ao carregar dados: {error.message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">Nenhum dado de disciplinas disponível</p>
      </div>
    );
  }

  // Pegar apenas as top N disciplinas
  const topSubjects = data
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, maxItems)
    .map(item => ({
      ...item,
      nome_curto: item.disciplina_nome.length > 15 
        ? item.disciplina_nome.substring(0, 15) + '...' 
        : item.disciplina_nome
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topSubjects} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="nome_curto" 
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Questões']}
          labelFormatter={(label, payload) => {
            const item = payload?.[0]?.payload;
            return item ? `Disciplina: ${item.disciplina_nome}` : label;
          }}
        />
        <Bar 
          dataKey="quantidade" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SubjectBarChart;
