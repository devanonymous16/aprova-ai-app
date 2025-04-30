import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopicPerformanceData } from '@/hooks/student/useStudentPerformanceData';
import { ArrowUpDown, BookText, Percent, HelpCircle, Clock } from 'lucide-react'; // Icons
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"; // Para barra de acerto

interface PerformanceTopicTableProps {
  data: TopicPerformanceData[];
}

// Tipos para ordenação
type SortKey = 'subjectName' | 'topicName' | 'accuracyPercentage' | 'questionsAnswered' | 'totalStudyTimeMinutes';
type SortDirection = 'asc' | 'desc';

export const PerformanceTopicTable: React.FC<PerformanceTopicTableProps> = ({ data }) => {
  const [sortKey, setSortKey] = useState<SortKey>('accuracyPercentage'); // Ordena por acerto (menor) por padrão
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedData = React.useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Trata nulos em acurácia (considera 0 para ordenação)
      if (sortKey === 'accuracyPercentage') {
         valA = valA ?? -1; // Nulos vêm antes ou depois dependendo da direção
         valB = valB ?? -1;
      }

      if (valA === null || valA === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (valB === null || valB === undefined) return sortDirection === 'asc' ? 1 : -1;

      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });

    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Inverte a direção se clicou na mesma coluna
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Define nova coluna e direção padrão (asc)
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Helper para o botão de ordenação
  const SortableHeader: React.FC<{ columnKey: SortKey; title: string; className?: string; children?: React.ReactNode }> =
   ({ columnKey, title, className, children }) => (
        <TableHead className={className}>
            <Button variant="ghost" onClick={() => handleSort(columnKey)} className="px-2 py-1 h-auto -ml-2">
                {children || title}
                <ArrowUpDown className={`ml-2 h-3 w-3 ${sortKey === columnKey ? 'opacity-100' : 'opacity-30'}`} />
            </Button>
        </TableHead>
   );


  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum dado de desempenho por tópico disponível.</p>;
  }

  return (
    <div className="w-full overflow-x-auto"> {/* Garante scroll horizontal se necessário */}
      <Table>
        <TableHeader>
          <TableRow>
             <SortableHeader columnKey="subjectName" title="Disciplina" className="min-w-[150px]" />
             <SortableHeader columnKey="topicName" title="Tópico" className="min-w-[200px]" />
             <SortableHeader columnKey="accuracyPercentage" title="% Acerto" className="w-[130px]">
                  <Percent className="h-4 w-4 inline-block mr-1"/> Acerto
             </SortableHeader>
             <SortableHeader columnKey="questionsAnswered" title="Questões" className="w-[100px] text-center">
                  <HelpCircle className="h-4 w-4 inline-block mr-1"/> Questões
             </SortableHeader>
            <SortableHeader columnKey="totalStudyTimeMinutes" title="Tempo Estudo" className="w-[110px] text-center">
                 <Clock className="h-4 w-4 inline-block mr-1"/> Tempo
            </SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.topicId}>
              <TableCell className="text-xs text-muted-foreground">{item.subjectName}</TableCell>
              <TableCell className="font-medium text-sm">{item.topicName}</TableCell>
              <TableCell>
                {item.accuracyPercentage !== null ? (
                  <div className="flex items-center gap-2">
                    <Progress value={item.accuracyPercentage} className="w-16 h-1.5" indicatorClassName={
                        item.accuracyPercentage < 50 ? "bg-red-500" : item.accuracyPercentage < 75 ? "bg-yellow-500" : "bg-green-500"
                    }/>
                    <span className={`text-sm font-semibold ${
                        item.accuracyPercentage < 50 ? "text-red-600" : item.accuracyPercentage < 75 ? "text-yellow-600" : "text-green-600"
                    }`}>{item.accuracyPercentage}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">N/D</span>
                )}
              </TableCell>
              <TableCell className="text-center text-sm">{item.questionsAnswered}</TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">{item.totalStudyTimeMinutes} min</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};