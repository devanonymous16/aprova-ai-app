import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  getAllPositions, 
  getSubjectsForPosition, 
  getRandomQuestionBySubject,
  PositionData, 
  SubjectForPositionData,
  RandomQuestionData
} from '@/lib/adminQueries';
import QuestionPreviewModal from './QuestionPreviewModal';

const QuestionSampleSection: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<PositionData | null>(null);
  const [selectedSubjectForPreview, setSelectedSubjectForPreview] = useState<SubjectForPositionData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Query para buscar todas as posições
  const { 
    data: positions, 
    isLoading: isLoadingPositions, 
    error: errorPositions 
  } = useQuery<PositionData[], Error>({
    queryKey: ['adminAllPositions'],
    queryFn: getAllPositions,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Query para buscar disciplinas da posição selecionada
  const { 
    data: subjects, 
    isLoading: isLoadingSubjects, 
    error: errorSubjects 
  } = useQuery<SubjectForPositionData[], Error>({
    queryKey: ['adminSubjectsForPosition', selectedPosition?.id, selectedPosition?.institution_id],
    queryFn: async () => {
      if (!selectedPosition) return Promise.resolve([]);
      console.log('🔍 [QuestionSampleSection] Buscando disciplinas para:', {
        positionId: selectedPosition.id,
        institutionId: selectedPosition.institution_id,
        positionName: selectedPosition.name
      });
      const result = await getSubjectsForPosition(selectedPosition.id, selectedPosition.institution_id);
      console.log('🔍 [QuestionSampleSection] Resultado da busca de disciplinas:', result);
      return result;
    },
    enabled: !!selectedPosition,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Query para buscar questão aleatória quando um subject for selecionado
  const { 
    data: randomQuestion, 
    isLoading: isLoadingQuestion, 
    error: errorQuestion 
  } = useQuery<RandomQuestionData | null, Error>({
    queryKey: ['randomQuestion', selectedSubjectForPreview?.id, selectedPosition?.id, selectedPosition?.institution_id],
    queryFn: () => {
      if (!selectedSubjectForPreview) return Promise.resolve(null);
      return getRandomQuestionBySubject(
        selectedSubjectForPreview.id,
        selectedPosition?.id,
        selectedPosition?.institution_id
      );
    },
    enabled: !!selectedSubjectForPreview && isModalOpen,
    staleTime: 0, // Sempre buscar uma nova questão
  });

  const handlePositionChange = (positionId: string) => {
    if (positionId === "none") {
      setSelectedPosition(null);
      return;
    }
    
    const position = positions?.find(p => p.id === positionId);
    if (position) {
      setSelectedPosition(position);
    }
  };

  const handleSubjectClick = (subject: SubjectForPositionData) => {
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
        <CardTitle>Amostra de Questões</CardTitle>
        <CardDescription>
          Selecione um cargo para visualizar as disciplinas disponíveis. Se não houver disciplinas específicas para o cargo, mostraremos uma amostra geral das disciplinas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dropdown de Cargos */}
        <div className="space-y-2">
          <label htmlFor="position-select" className="text-sm font-medium">
            Selecionar Cargo:
          </label>
          <Select
            value={selectedPosition?.id || ""}
            onValueChange={handlePositionChange}
            disabled={isLoadingPositions}
          >
            <SelectTrigger id="position-select" className="w-full">
              <SelectValue 
                placeholder={
                  isLoadingPositions 
                    ? "Carregando cargos..." 
                    : "Escolha um cargo para ver as disciplinas"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum cargo selecionado</SelectItem>
              {positions?.map(position => (
                <SelectItem key={position.id} value={position.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{position.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {position.institution_name}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {errorPositions && (
            <p className="text-sm text-red-500">
              Erro ao carregar cargos: {errorPositions.message}
            </p>
          )}
        </div>

        {/* Informações do Cargo Selecionado */}
        {selectedPosition && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Cargo Selecionado:</h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Nome:</span> {selectedPosition.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Instituição:</span> {selectedPosition.institution_name}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Disciplinas */}
        {selectedPosition && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              Disciplinas Disponíveis:
            </h3>
            
            {/* Info sobre o tipo de busca */}
            {subjects && subjects.length > 0 && (
              <div className="p-2 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-700">
                {subjects.some(s => s.question_count > 0) 
                  ? "✅ Mostrando disciplinas específicas para este cargo"
                  : "ℹ️ Mostrando amostra geral de disciplinas (nenhuma específica encontrada para este cargo). As questões exibidas podem ser de outros cargos relacionados."
                }
              </div>
            )}
            
            {isLoadingSubjects ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
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
                  Nenhuma disciplina encontrada para este cargo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map(subject => (
                  <div
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject)}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">
                        {subject.name}
                      </h4>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {subject.question_count} questões
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      👁️ Clique para ver uma questão de exemplo
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mensagem quando nenhum cargo está selecionado */}
        {!selectedPosition && !isLoadingPositions && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Selecione um cargo acima para ver as disciplinas disponíveis
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
      />
    </Card>
  );
};

export default QuestionSampleSection;
