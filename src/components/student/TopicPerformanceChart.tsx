// src/components/student/TopicPerformanceChart.tsx
import React, { useEffect, useState } from 'react'; // Adicionado useEffect e useState
// import { supabase } from '@/integrations/supabase/client'; // Descomente se for buscar dados reais
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTopicPerformanceComparison } from '@/services/mockStudentData'; // Usando mock por enquanto

// Defina a interface para os dados do gráfico
interface TopicPerformanceData {
  topic: string;
  topicId: string;
  performance: number; // Seu desempenho (0-100)
  average: number;     // Média geral (0-100)
  difference?: number; // Opcional
}

export interface TopicPerformanceChartProps {
  studentId: string | undefined; // Pode ser undefined se o usuário não estiver logado
  examPositionId: string | null; // Pode ser null se nenhum cargo estiver em foco
}

export default function TopicPerformanceChart({ studentId, examPositionId }: TopicPerformanceChartProps) {
  const [chartData, setChartData] = useState<TopicPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId || !examPositionId) {
        setChartData([]); // Limpa os dados se não houver ID de estudante ou cargo
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        console.log(`[TopicPerformanceChart] Buscando dados para student ${studentId}, position ${examPositionId}`);
        // TODO: Substituir mock por chamada real ao backend que usa studentId e examPositionId
        const data = await getTopicPerformanceComparison(studentId, examPositionId);
        setChartData(data);
      } catch (error) {
        console.error("Error fetching topic performance data:", error);
        setChartData([]); // Limpa em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, examPositionId]); // Re-busca quando studentId ou examPositionId mudarem

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Desempenho por Tópico</CardTitle></CardHeader>
        <CardContent><p>Carregando dados de desempenho...</p></CardContent>
      </Card>
    );
  }
  
  if (chartData.length === 0 && !loading) {
     return (
      <Card>
        <CardHeader><CardTitle>Desempenho por Tópico</CardTitle></CardHeader>
        <CardContent><p>Ainda não há dados de desempenho suficientes para este concurso.</p></CardContent>
      </Card>
    );
  }

  // Separar tópicos com melhor e pior desempenho em relação à média
  const bestTopics = chartData.filter(d => d.performance > d.average).sort((a, b) => (b.performance - b.average) - (a.performance - a.average)).slice(0, 5);
  const worstTopics = chartData.filter(d => d.performance < d.average).sort((a, b) => (a.performance - a.average) - (b.performance - b.average)).slice(0, 5);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho por Tópico</CardTitle>
        <CardDescription>Compare seu desempenho com a média geral dos estudantes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}> {/* Ajuste de margem left */}
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" angle={-30} textAnchor="end" height={70} interval={0} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Bar dataKey="performance" fill="#8884d8" name="Seu Desempenho" radius={[4, 4, 0, 0]} />
              <Bar dataKey="average" fill="#82ca9d" name="Média Geral" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-green-600">Tópicos com melhor desempenho (vs Média)</h3>
            {bestTopics.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {bestTopics.map(t => (
                  <li key={t.topicId}>{t.topic}: <span className="font-semibold">{t.performance}%</span> (Média: {t.average}%)</li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">Seu desempenho está alinhado ou abaixo da média em todos os tópicos.</p>}
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-red-600">Tópicos que precisam de atenção (vs Média)</h3>
            {worstTopics.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {worstTopics.map(t => (
                  <li key={t.topicId}>{t.topic}: <span className="font-semibold">{t.performance}%</span> (Média: {t.average}%)</li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">Seu desempenho está alinhado ou acima da média em todos os tópicos.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}