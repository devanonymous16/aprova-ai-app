// src/pages/dashboard/admin/Index.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { 
    getTotalQuestions, 
    getQuestionEvolution,
    getQuestionsBySubject,
    getQuestionsByBanca,
    QuestionEvolutionData,
    QuestionsBySubjectData,
    QuestionsByBancaData
} from '@/lib/adminQueries'; 
import { Skeleton } from '@/components/ui/skeleton';
import EvolutionChart from '@/components/admin/dashboard/EvolutionChart';
import SubjectBarChart from '@/components/admin/dashboard/SubjectBarChart';
import BancaDonutChart from '@/components/admin/dashboard/BancaDonutChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [selectedSubjectForDetail, setSelectedSubjectForDetail] = useState<string | null>(null);
  const [selectedBancaForDetail, setSelectedBancaForDetail] = useState<string | null>(null);

  const { 
    data: totalQuestions, isLoading: isLoadingTotalQuestions, error: errorTotalQuestions 
  } = useQuery<number, Error>({ queryKey: ['adminTotalQuestions'], queryFn: getTotalQuestions, staleTime: 1000 * 60 * 5, refetchInterval: 1000 * 60 * 60 });
  const { 
    data: evolutionData, isLoading: isLoadingEvolution, error: errorEvolution 
  } = useQuery<QuestionEvolutionData[], Error>({ queryKey: ['adminQuestionEvolution'], queryFn: getQuestionEvolution, staleTime: 1000 * 60 * 5, refetchInterval: 1000 * 60 * 60 });
  const { 
    data: allQuestionsBySubjectData, isLoading: isLoadingQuestionsBySubject, error: errorQuestionsBySubject 
  } = useQuery<QuestionsBySubjectData[], Error>({ queryKey: ['adminAllQuestionsBySubject'], queryFn: getQuestionsBySubject, staleTime: 1000 * 60 * 5, refetchInterval: 1000 * 60 * 60 });
  const { 
    data: allQuestionsByBancaData, isLoading: isLoadingQuestionsByBanca, error: errorQuestionsByBanca 
  } = useQuery<QuestionsByBancaData[], Error>({ queryKey: ['adminAllQuestionsByBanca'], queryFn: getQuestionsByBanca, staleTime: 1000 * 60 * 5, refetchInterval: 1000 * 60 * 60 });

  useEffect(() => { document.title = 'Forefy | Admin Dashboard'; }, []);
  useEffect(() => {
    if (errorTotalQuestions) console.error("Erro total questões:", errorTotalQuestions);
    if (errorEvolution) console.error("Erro evolução:", errorEvolution);
    if (errorQuestionsBySubject) console.error("Erro disciplinas:", errorQuestionsBySubject);
    if (errorQuestionsByBanca) console.error("Erro bancas:", errorQuestionsByBanca);
  }, [errorTotalQuestions, errorEvolution, errorQuestionsBySubject, errorQuestionsByBanca]);

  const selectedSubjectDetails = allQuestionsBySubjectData?.find(s => s.disciplina_id === selectedSubjectForDetail);
  const selectedBancaDetails = allQuestionsByBancaData?.find(b => b.banca_id === selectedBancaForDetail);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-800">
          Admin Dashboard - Forefy
        </h1>
        {profile && <p className="text-sm text-muted-foreground mt-2 sm:mt-0">Logado como: {profile.name} ({profile.role})</p>}
      </div>

      {/* Seção de Destaque: Total de Questões e Evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1 flex flex-col justify-center items-center text-center h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-gray-700">Total de Questões Ativas</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex justify-center items-center">
            {isLoadingTotalQuestions ? (
              <Skeleton className="h-20 w-40" />
            ) : errorTotalQuestions ? (
              <p className="text-2xl text-red-500">Erro!</p>
            ) : (
              <p className="text-6xl md:text-7xl font-poppins font-bold text-primary-dark">
                {totalQuestions !== undefined ? totalQuestions.toLocaleString('pt-BR') : 'N/A'}
              </p>
            )}
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <EvolutionChart 
              data={evolutionData} 
              isLoading={isLoadingEvolution} 
              error={errorEvolution}
          />
        </div>
      </div>

      {/* Seção de Análises Detalhadas: Disciplinas e Bancas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card para Questões por Disciplina */}
        <Card>
            <CardHeader>
                <CardTitle>Questões por Disciplina</CardTitle>
                <CardDescription>Use o seletor abaixo para ver detalhes de uma disciplina específica.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select
                    value={selectedSubjectForDetail || ""}
                    onValueChange={(value) => setSelectedSubjectForDetail(value === "all" || !value ? null : value)}
                    disabled={isLoadingQuestionsBySubject || !allQuestionsBySubjectData || allQuestionsBySubjectData.length === 0}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingQuestionsBySubject ? "Carregando disciplinas..." : "Detalhar por Disciplina"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Visão Geral (Top 10 no Gráfico)</SelectItem>
                        {allQuestionsBySubjectData?.map(subject => (
                            <SelectItem key={subject.disciplina_id} value={subject.disciplina_id}>
                                {subject.disciplina_nome} ({subject.quantidade.toLocaleString('pt-BR')})
                            </SelectItem>
                        ))}
                         {(!allQuestionsBySubjectData || allQuestionsBySubjectData.length === 0) && !isLoadingQuestionsBySubject && (
                            <SelectItem value="no-data" disabled>Nenhuma disciplina com questões</SelectItem>
                         )}
                    </SelectContent>
                </Select>
                {selectedSubjectDetails ? (
                    <div className="mt-2 p-3 bg-slate-50 rounded-md text-sm">
                        <p><strong>Disciplina Selecionada:</strong> {selectedSubjectDetails.disciplina_nome}</p>
                        <p><strong>Total de Questões:</strong> {selectedSubjectDetails.quantidade.toLocaleString('pt-BR')}</p>
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                        O gráfico abaixo mostra as top 10 disciplinas.
                    </p>
                )}
                 <SubjectBarChart 
                    data={allQuestionsBySubjectData} // Passa todos, o componente lida com o top N
                    isLoading={isLoadingQuestionsBySubject}
                    error={errorQuestionsBySubject}
                    maxItems={10} // Gráfico mostra top 10
                />
            </CardContent>
        </Card>

        {/* Card para Questões por Banca */}
        <Card>
            <CardHeader>
                <CardTitle>Questões por Banca</CardTitle>
                <CardDescription>Use o seletor abaixo para ver detalhes de uma banca específica.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select
                    value={selectedBancaForDetail || ""}
                    onValueChange={(value) => setSelectedBancaForDetail(value === "all" || !value ? null : value)}
                    disabled={isLoadingQuestionsByBanca || !allQuestionsByBancaData || allQuestionsByBancaData.length === 0}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingQuestionsByBanca ? "Carregando bancas..." : "Detalhar por Banca"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Visão Geral (Top 10 no Gráfico)</SelectItem>
                        {allQuestionsByBancaData?.map(banca => (
                            <SelectItem key={banca.banca_id} value={banca.banca_id}>
                                {banca.banca_nome} ({banca.quantidade.toLocaleString('pt-BR')})
                            </SelectItem>
                        ))}
                         {(!allQuestionsByBancaData || allQuestionsByBancaData.length === 0) && !isLoadingQuestionsByBanca && (
                            <SelectItem value="no-data" disabled>Nenhuma banca com questões</SelectItem>
                         )}
                    </SelectContent>
                </Select>
                {selectedBancaDetails ? (
                    <div className="mt-2 p-3 bg-slate-50 rounded-md text-sm">
                        <p><strong>Banca Selecionada:</strong> {selectedBancaDetails.banca_nome}</p>
                        <p><strong>Total de Questões:</strong> {selectedBancaDetails.quantidade.toLocaleString('pt-BR')}</p>
                    </div>
                ) : (
                     <p className="mt-2 text-sm text-muted-foreground">
                        O gráfico abaixo mostra as top 10 bancas.
                    </p>
                )}
                <BancaDonutChart
                    data={allQuestionsByBancaData} // Passa todos, o componente lida com o top N
                    isLoading={isLoadingQuestionsByBanca}
                    error={errorQuestionsByBanca}
                    maxItems={10} // Gráfico mostra top 10
                />
            </CardContent>
        </Card>
      </div>
      {/* Você pode adicionar mais seções/gráficos aqui no futuro */}
    </div>
  );
}