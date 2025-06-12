// src/components/admin/dashboard/BancaDonutChart.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { QuestionsByBancaData } from '@/lib/adminQueries';

interface BancaDonutChartProps {
  data: QuestionsByBancaData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  maxItems?: number; // Nova prop para limitar itens no gráfico
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF00AA', '#55AADD', '#DD55AA', '#A0522D', '#D2691E', '#FF7F50', '#6495ED'];

export default function BancaDonutChart({ data, isLoading, error, maxItems = 10 }: BancaDonutChartProps) { // Default de 10 itens
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Questões por Banca</CardTitle><CardDescription>Carregando...</CardDescription></CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Questões por Banca</CardTitle><CardDescription className="text-red-500">Erro ao carregar.</CardDescription></CardHeader>
        <CardContent><p>Não foi possível buscar os dados.</p></CardContent>
      </Card>
    );
  }

  // Prepara os dados para o gráfico (top N)
  const chartData = data && data.length > 0 ? data.slice(0, maxItems) : [];
  // Se houver mais itens do que maxItems, podemos adicionar uma categoria "Outros"
  // let finalChartData = chartData;
  // if (data && data.length > maxItems) {
  //   const othersCount = data.slice(maxItems).reduce((sum, item) => sum + item.quantidade, 0);
  //   if (othersCount > 0) {
  //     finalChartData = [...chartData, { banca_id: 'others', banca_nome: 'Outras', quantidade: othersCount }];
  //   }
  // }
  // Para MVP, vamos manter simples e mostrar apenas o top N no gráfico. O dropdown mostrará todos.


  if (chartData.length === 0 && !isLoading && !error) {
    return (
      <Card>
        <CardHeader><CardTitle>Questões por Banca</CardTitle><CardDescription>Sem dados.</CardDescription></CardHeader>
        <CardContent><p>Nenhuma questão encontrada por banca para exibir no gráfico.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top {maxItems} Bancas por Nº de Questões</CardTitle>
        <CardDescription>Distribuição de questões ativas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData} // Usando chartData (limitado)
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80} // Reduzido um pouco para caber melhor com a legenda
              innerRadius={50} 
              fill="#8884d8"
              dataKey="quantidade"
              nameKey="banca_nome"
              paddingAngle={1}
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString('pt-BR')} questões`, name]} />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle" 
              iconSize={10}
              wrapperStyle={{ lineHeight: '18px', fontSize: '12px', paddingLeft: '10px' }}
              formatter={(value, entry) => {
                const { color, payload } = entry as any; 
                return <span style={{ color: color || '#000' }}>{value} ({payload?.payload?.quantidade.toLocaleString('pt-BR')})</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}