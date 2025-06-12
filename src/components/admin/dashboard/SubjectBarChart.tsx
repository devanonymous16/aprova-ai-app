// src/components/admin/dashboard/SubjectBarChart.tsx
// import React from 'react'; // Removido se não usado explicitamente
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton'; // Skeleton está sendo usado
import { QuestionsBySubjectData } from '@/lib/adminQueries';

interface SubjectBarChartProps {
  data: QuestionsBySubjectData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  maxItems?: number;
}

// Função para customizar o label dentro da barra
// Tipando props de forma mais explícita (conforme a API do Recharts para content de LabelList)
interface CustomizedLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number | string;
  index?: number;
  // Adicione outras props que o Recharts passa se necessário, como `payload`, `viewBox`
}

const renderCustomizedLabel: React.FC<CustomizedLabelProps> = (props) => {
  const { x, y, width, height, value } = props;

  // É crucial que x, y, width, height e value tenham valores numéricos válidos
  // para o posicionamento e exibição do <text>.
  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number' || value === undefined) {
    return null; 
  }
  if (width < 30) { 
    return null;
  }
  return (
    <text 
      x={x + width - 5} // Ajuste para posicionar à direita dentro da barra
      y={y + height / 2} 
      fill="#fff" 
      textAnchor="end" 
      dominantBaseline="middle" // Alinha verticalmente ao centro
      fontSize="10px" 
      fontWeight="bold"
    >
      {value}
    </text>
  );
};


export default function SubjectBarChart({ data, isLoading, error, maxItems = 20 }: SubjectBarChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Questões por Disciplina</CardTitle><CardDescription>Carregando...</CardDescription></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
      </Card>
    );
  }
  if (error) { /* ... (bloco de erro igual) ... */ }
  
  const chartData = data && data.length > 0 ? data.slice(0, maxItems) : [];

  if (chartData.length === 0) { // Só renderiza mensagem de "sem dados" se não estiver carregando e não houver erro
    return (
      <Card>
        <CardHeader><CardTitle>Questões por Disciplina</CardTitle></CardHeader>
        <CardContent><p>Nenhuma disciplina com questões encontradas.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top {maxItems} Disciplinas por Nº de Questões</CardTitle>
        <CardDescription>Distribuição das questões ativas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 35)}> 
          <BarChart
            layout="vertical"
            data={chartData} 
            margin={{ top: 5, right: 40, left: 10, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
            <YAxis 
              type="category" 
              dataKey="disciplina_nome" 
              width={180} 
              tick={{ fontSize: 10 }} 
              interval={0} 
            />
            <Tooltip 
              formatter={(value: number) => [value.toLocaleString('pt-BR'), "Questões"]}
              labelFormatter={(label: string) => `${label}`}
            />
                <Bar dataKey="quantidade" fill="#457B9D" name="Nº de Questões" barSize={25} radius={[0, 4, 4, 0]}>
                <LabelList 
                 dataKey="quantidade" 
                 position="right" // Para barras horizontais, "right" coloca fora da barra; "insideRight" ou "middle" dentro.
                                 // Vamos tentar "insideEnd" que é mais apropriado para o que queremos.
                 offset={5} // Pequeno deslocamento para não ficar colado na borda
                 fill="#fff" 
                 fontSize={10}
                 fontWeight="bold"
                 // formatter={(value: number) => value > 0 ? value : ''} // Opcional: não mostrar 0
               />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}