import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  getAllBancas, 
  getSubjectsForBanca, 
  getRandomQuestionByBancaAndSubject,
  BancaData, 
  SubjectForBancaData,
  RandomQuestionData
} from '@/lib/adminQueries';
import QuestionPreviewModal from './QuestionPreviewModal';

const QuestionSampleSection: React.FC = () => {
  const [selectedBanca, setSelectedBanca] = useState<BancaData | null>(null);
  const [selectedSubjectForPreview, setSelectedSubjectForPreview] = useState<SubjectForBancaData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Query para buscar todas as bancas
  const { 
    data: bancas, 
    isLoading: isLoadingBancas, 
    error: errorBancas 
  } = useQuery<BancaData[], Error>({
    queryKey: ['adminAllBancas'],
    queryFn: getAllBancas,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Query para buscar disciplinas da banca selecionada
  const { 
    data: subjects, 
    isLoading: isLoadingSubjects, 
    error: errorSubjects 
  } = useQuery<SubjectForBancaData[], Error>({
    queryKey: ['adminSubjectsForBanca', selectedBanca?.id],
    queryFn: async () => {
      if (!selectedBanca) return Promise.resolve([]);
      console.log('🔍 [QuestionSampleSection] Buscando disciplinas para banca:', {
        bancaId: selectedBanca.id,
        bancaName: selectedBanca.name
      });
      const result = await getSubjectsForBanca(selectedBanca.id);
      console.log('🔍 [QuestionSampleSection] Resultado da busca de disciplinas por banca:', result);
      return result;
    },
    enabled: !!selectedBanca,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Query para buscar questão aleatória quando um subject for selecionado
  const { 
    data: randomQuestion, 
    isLoading: isLoadingQuestion, 
    error: errorQuestion 
  } = useQuery<RandomQuestionData | null, Error>({
    queryKey: ['randomQuestionByBanca', selectedBanca?.id, selectedSubjectForPreview?.id],
    queryFn: () => {
      if (!selectedBanca || !selectedSubjectForPreview) return Promise.resolve(null);
      return getRandomQuestionByBancaAndSubject(selectedBanca.id, selectedSubjectForPreview.id);
    },
    enabled: !!selectedBanca && !!selectedSubjectForPreview && isModalOpen,
    staleTime: 0, // Sempre buscar uma nova questão
  });

  const handleBancaChange = (bancaId: string) => {
    if (bancaId === "none") {
      setSelectedBanca(null);
      return;
    }
    
    const banca = bancas?.find(b => b.id === bancaId);
    if (banca) {
      setSelectedBanca(banca);
    }
  };

  const handleSubjectClick = (subject: SubjectForBancaData) => {
    setSelectedSubjectForPreview(subject);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubjectForPreview(null);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Amostra de Questões por Banca</CardTitle>
        <CardDescription>
          Selecione uma banca para visualizar as disciplinas disponíveis e exemplos de questões. 
          Clique em qualquer disciplina para ver uma questão de exemplo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dropdown de Bancas */}
        <div className="space-y-2">
          <label htmlFor="banca-select" className="text-sm font-medium">
            Selecionar Banca:
          </label>
          <Select
            value={selectedBanca?.id || ""}
            onValueChange={handleBancaChange}
            disabled={isLoadingBancas}
          >
            <SelectTrigger id="banca-select" className="w-full">
              <SelectValue 
                placeholder={
                  isLoadingBancas 
                    ? "Carregando bancas..." 
                    : "Escolha uma banca para ver as disciplinas"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma banca selecionada</SelectItem>
              {bancas?.map(banca => (
                <SelectItem key={banca.id} value={banca.id}>
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium">{banca.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {banca.question_count} questões
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {errorBancas && (
            <p className="text-sm text-red-500">
              Erro ao carregar bancas: {errorBancas.message}
            </p>
          )}
        </div>

        {/* Informações da Banca Selecionada */}
        {selectedBanca && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Banca Selecionada:</h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Nome:</span> {selectedBanca.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Total de Questões:</span> {selectedBanca.question_count}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Disciplinas */}
        {selectedBanca && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              Disciplinas Disponíveis:
            </h3>
            
            {/* Info sobre a busca por banca */}
            {subjects && subjects.length > 0 && (
              <div className="p-2 bg-green-50 border-l-4 border-green-400 text-sm text-green-700">
                ✅ Mostrando disciplinas específicas desta banca ({selectedBanca.name})
              </div>
            )}
            
            {isLoadingSubjects ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : errorSubjects ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  Erro ao carregar disciplinas: {errorSubjects.message}
                </p>
              </div>
            ) : !subjects || subjects.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm">
                  Nenhuma disciplina encontrada para esta banca.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map(subject => (
                  <div
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject)}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">
                        {subject.name}
                      </h4>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {subject.question_count} questões
                      </Badge>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      👁️ Clique para ver uma questão de exemplo
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mensagem quando nenhuma banca está selecionada */}
        {!selectedBanca && !isLoadingBancas && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Selecione uma banca acima para ver as disciplinas disponíveis
            </p>
          </div>
        )}
      </CardContent>

      {/* Modal de Pré-visualização da Questão */}
      <QuestionPreviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        question={randomQuestion}
        isLoading={isLoadingQuestion}
        error={errorQuestion}
        subjectName={selectedSubjectForPreview?.name || ''}
        bancaName={selectedBanca?.name || ''}
      />
    </Card>
  );
};

export default QuestionSampleSection;