import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RandomQuestionData } from '@/lib/adminQueries';

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: RandomQuestionData | null;
  isLoading: boolean;
  error: Error | null;
  subjectName: string;
}

const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({
  isOpen,
  onClose,
  question,
  isLoading,
  error,
  subjectName
}) => {
  const options = question ? [
    { letter: 'A', text: question.item_a },
    { letter: 'B', text: question.item_b },
    { letter: 'C', text: question.item_c },
    { letter: 'D', text: question.item_d },
    ...(question.item_e ? [{ letter: 'E', text: question.item_e }] : [])
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Amostra de Questão - {subjectName}</DialogTitle>
          <DialogDescription>
            Exemplo de questão desta disciplina (apenas para visualização)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                Erro ao carregar questão: {error.message}
              </p>
            </div>
          )}

          {!isLoading && !error && !question && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Nenhuma questão encontrada para esta disciplina.
              </p>
            </div>
          )}

          {question && !isLoading && !error && (
            <div className="space-y-6">
              {/* Aviso sobre busca não específica */}
              {question.search_level !== 'specific' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-amber-600">⚠️</span>
                    <div className="text-amber-700 text-sm">
                      <p className="font-medium">Questão de outro cargo relacionado</p>
                      <p>
                        {question.search_level === 'position_only' 
                          ? 'Esta questão é do mesmo cargo mas de outra instituição'
                          : `Esta questão é do cargo "${question.question_position || 'N/A'}" ${question.question_institution ? `da ${question.question_institution}` : ''}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadados da questão */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {question.subject_name}
                </Badge>
                {question.topic_name && (
                  <Badge variant="outline">
                    {question.topic_name}
                  </Badge>
                )}
                {question.banca_name && (
                  <Badge variant="outline">
                    {question.banca_name}
                  </Badge>
                )}
                {question.search_level !== 'specific' && question.question_position && (
                  <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700">
                    🏢 {question.question_position}
                  </Badge>
                )}
              </div>

              {/* Enunciado da questão */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: question.statement }}
                />
              </div>

              {/* Alternativas */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Alternativas:</h4>
                {options.map((option) => (
                  <div
                    key={option.letter}
                    className={`p-3 border rounded-lg transition-colors ${
                      option.letter === question.correct_option
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          option.letter === question.correct_option
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {option.letter}
                      </div>
                      <div 
                        className="prose prose-sm max-w-none flex-1"
                        dangerouslySetInnerHTML={{ __html: option.text }}
                      />
                      {option.letter === question.correct_option && (
                        <Badge variant="default" className="bg-green-500">
                          Resposta Correta
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Informação sobre a resposta */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  💡 A resposta correta é a alternativa <strong>{question.correct_option}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionPreviewModal;
