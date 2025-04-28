
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TopicPerformanceData {
  topic: string;
  performance: number;
  average: number;
  difference: number;
}

interface TopicPerformanceChartProps {
  studentId: string;
  examId: string;
}

export default function TopicPerformanceChart({ studentId, examId }: TopicPerformanceChartProps) {
  // Mock data for the chart
  const performanceData = [
    { topic: 'Direito Constitucional', performance: 85, average: 72, difference: 13 },
    { topic: 'Língua Portuguesa', performance: 78, average: 68, difference: 10 },
    { topic: 'Direito Administrativo', performance: 65, average: 70, difference: -5 },
    { topic: 'Legislação de Trânsito', performance: 92, average: 75, difference: 17 },
    { topic: 'Direitos Humanos', performance: 88, average: 82, difference: 6 },
    { topic: 'Primeiros Socorros', performance: 95, average: 80, difference: 15 },
    { topic: 'Direito Penal', performance: 72, average: 68, difference: 4 },
    { topic: 'Legislação Municipal', performance: 83, average: 76, difference: 7 }
  ];
  
  // Get the best and worst performing topics
  const bestPerforming = [...performanceData]
    .sort((a, b) => b.difference - a.difference)
    .slice(0, 5);
  
  const worstPerforming = [...performanceData]
    .sort((a, b) => a.difference - b.difference)
    .slice(0, 5);
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Desempenho por Tópico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData.slice(0, 8)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="topic" 
                tick={{ fontSize: 12 }} 
                height={60} 
                interval={0} 
                tickFormatter={(value) => 
                  value.length > 15 ? `${value.substring(0, 15)}...` : value
                }
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`]} 
                labelStyle={{ color: '#111' }}
              />
              <Legend />
              <Bar dataKey="performance" name="Seu Desempenho" fill="#9b87f5" />
              <Bar dataKey="average" name="Média Geral" fill="#8E9196" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Best performing topics */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Tópicos com melhor desempenho</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tópico</TableHead>
                  <TableHead className="text-right">Seu Desempenho</TableHead>
                  <TableHead className="text-right">Média Geral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestPerforming.map((topic) => (
                  <TableRow key={topic.topic}>
                    <TableCell className="font-medium">{topic.topic}</TableCell>
                    <TableCell className="text-right">{topic.performance}%</TableCell>
                    <TableCell className="text-right">{topic.average}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Worst performing topics */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Tópicos que precisam de atenção</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tópico</TableHead>
                  <TableHead className="text-right">Seu Desempenho</TableHead>
                  <TableHead className="text-right">Média Geral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {worstPerforming.map((topic) => (
                  <TableRow key={topic.topic}>
                    <TableCell className="font-medium">{topic.topic}</TableCell>
                    <TableCell className="text-right">{topic.performance}%</TableCell>
                    <TableCell className="text-right">{topic.average}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
