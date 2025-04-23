
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function StudentSolveQuestion() {
  const { subtopicId } = useParams<{ subtopicId: string }>();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Mock question data
  const question = {
    id: "q1",
    content: "Sobre o controle de constitucionalidade, assinale a alternativa correta:",
    options: [
      "O controle difuso de constitucionalidade pode ser exercido somente pelo Supremo Tribunal Federal.",
      "No controle concentrado, qualquer juiz pode declarar a inconstitucionalidade de lei ou ato normativo.",
      "A decisão do Supremo Tribunal Federal em Ação Direta de Inconstitucionalidade possui efeito vinculante e eficácia contra todos.",
      "O controle de constitucionalidade preventivo é realizado exclusivamente pelo Poder Judiciário.",
      "As decisões em controle difuso sempre possuem efeitos ex nunc, ou seja, não retroativos."
    ],
    correctOption: 2,
    explanation: "O controle concentrado de constitucionalidade é exercido pelo Supremo Tribunal Federal por meio de ações específicas como a Ação Direta de Inconstitucionalidade (ADI). A decisão proferida em sede de ADI possui efeito vinculante e eficácia contra todos (erga omnes), conforme previsto na Constituição Federal, art. 102, §2º.",
    topic: "Direito Constitucional",
    subtopic: "Controle de Constitucionalidade"
  };
  
  const handleSubmit = () => {
    if (selectedOption !== null) {
      setShowExplanation(true);
    }
  };
  
  const handleNext = () => {
    // In a real app, this would load the next question
    setSelectedOption(null);
    setShowExplanation(false);
  };
  
  const isCorrect = selectedOption === question.correctOption;
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/student/study-plan">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Plano de Estudos
        </Button>
      </Link>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>{question.topic}</span>
          <span>•</span>
          <span>{question.subtopic}</span>
        </div>
        <h1 className="text-2xl font-bold font-heading">Questão</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="border-b">
          <CardTitle className="text-base">{question.content}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <label 
                  className={`flex items-center gap-3 p-3 rounded-lg border w-full cursor-pointer transition-colors ${
                    showExplanation && index === question.correctOption ? 'bg-green-50 border-green-300' : 
                    showExplanation && selectedOption === index ? 'bg-red-50 border-red-300' : 
                    selectedOption === index ? 'bg-primary-50 border-primary' : 
                    'hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className={`flex items-center justify-center h-6 w-6 rounded-full border ${
                      showExplanation && index === question.correctOption ? 'border-green-500 bg-green-100' : 
                      showExplanation && selectedOption === index ? 'border-red-500 bg-red-100' : 
                      selectedOption === index ? 'border-primary bg-primary text-white' : 
                      'border-gray-300'
                    }`}
                  >
                    <span className="text-sm">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <span className="text-sm">{option}</span>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!showExplanation ? (
            <Button 
              onClick={handleSubmit} 
              disabled={selectedOption === null}
              className="ml-auto"
            >
              Verificar resposta
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="ml-auto"
            >
              Próxima questão <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {showExplanation && (
        <Card className={isCorrect ? 'border-green-300' : 'border-red-300'}>
          <CardHeader className={`${isCorrect ? 'bg-green-50' : 'bg-red-50'} border-b ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
            <CardTitle className="flex items-center text-base">
              {isCorrect ? (
                <span className="text-green-700">Resposta correta!</span>
              ) : (
                <span className="text-red-700">Resposta incorreta</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <h4 className="font-medium mb-2">Explicação:</h4>
            <p className="text-sm">{question.explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
