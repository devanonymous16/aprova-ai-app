
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTopicPerformanceComparison } from "@/services/mockStudentData";

interface TopicPerformanceData {
  topic: string;
  topicId: string;
  performance: number;
  average: number;
  difference: number;
}

interface TopicPerformanceChartProps {
  studentId: string;
  examId: string;
}

export default function TopicPerformanceChart({ studentId, examId }: TopicPerformanceChartProps) {
  const [performanceData, setPerformanceData] = useState<TopicPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopicPerformanceComparison(studentId, examId);
        setPerformanceData(data);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId, examId]);
  
  // Get the best and worst performing topics
  const bestPerforming = [...performanceData].sort((a, b) => b.difference - a.difference).slice(0, 5);
  const worstPerforming = [...performanceData].sort((a, b) => a.difference - b.difference).slice(0, 5);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Tópico</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho por Tópico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData.slice(0, 8)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" tick={{ fontSize: 12 }} height={60} interval={0} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
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
                  <TableRow key={topic.topicId}>
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
                  <TableRow key={topic.topicId}>
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
