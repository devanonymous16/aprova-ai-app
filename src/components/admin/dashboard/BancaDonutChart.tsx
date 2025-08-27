import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { QuestionsByBancaData } from '@/lib/adminQueries';

interface BancaDonutChartProps {
  data?: QuestionsByBancaData[];
  isLoading: boolean;
  error?: Error | null;
  maxItems?: number;
}

// Cores para o gráfico de pizza
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

const BancaDonutChart: React.FC<BancaDonutChartProps> = ({ 
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
        <p className="text-gray-500">Nenhum dado de bancas disponível</p>
      </div>
    );
  }

  // Pegar apenas as top N bancas
  const topBancas = data
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, maxItems)
    .map((item, index) => ({
      ...item,
      nome_curto: item.banca_nome.length > 20 
        ? item.banca_nome.substring(0, 20) + '...' 
        : item.banca_nome,
      color: COLORS[index % COLORS.length]
    }));

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{data.banca_nome}</p>
          <p className="text-blue-600">
            Questões: {data.quantidade.toLocaleString('pt-BR')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={topBancas}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="quantidade"
        >
          {topBancas.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={customTooltip} />
        <Legend 
          formatter={(value, entry: any) => entry.payload.nome_curto}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BancaDonutChart;
