
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Clock, AlertCircle } from "lucide-react";

export default function StudentSimulado() {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>(Array(5).fill(null));
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [simuladoFinished, setSimuladoFinished] = useState(false);
  
  // Mock simulado data
  const simulado = {
    id: "sim001",
    title: "Simulado TJ-SP - Analista Judiciário",
    totalQuestions: 5,
    totalTime: 7200, // 2 hours in seconds
    questions: [
      {
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
        topic: "Direito Constitucional"
      },
      {
        id: "q2",
        content: "A respeito da licitação, é correto afirmar que:",
        options: [
          "É dispensável nos casos de guerra ou grave perturbação da ordem.",
          "É inexigível quando houver inviabilidade de competição.",
          "É vedada para contratações de pequeno valor.",
          "A modalidade convite permite a participação de quaisquer interessados.",
          "É permitida a criação de outras modalidades de licitação pelos estados e municípios."
        ],
        correctOption: 1,
        topic: "Direito Administrativo"
      },
      {
        id: "q3",
        content: "Na regência verbal, assinale a alternativa correta:",
        options: [
          "Ele assistiu o filme ontem.",
          "Prefiro mais chocolate do que baunilha.",
          "O médico assistiu ao paciente com dedicação.",
          "Informei-lhe que o prazo estava encerrado.",
          "Lembro aquele dia com carinho."
        ],
        correctOption: 2,
        topic: "Português"
      },
      {
        id: "q4",
        content: "Sobre os recursos no processo civil, assinale a alternativa incorreta:",
        options: [
          "O recurso adesivo é admissível na apelação, nos embargos infringentes, no recurso especial e no recurso extraordinário.",
          "A renúncia ao direito de recorrer independe da aceitação da outra parte.",
          "O recorrente poderá desistir do recurso a qualquer tempo, sem anuência do recorrido.",
          "O recurso extraordinário não tem efeito suspensivo.",
          "Os embargos de declaração interrompem o prazo para outros recursos."
        ],
        correctOption: 3,
        topic: "Direito Processual Civil"
      },
      {
        id: "q5",
        content: "Se 3 servidores realizam um trabalho em 6 dias, em quantos dias 6 servidores realizarão o mesmo trabalho?",
        options: [
          "1 dia",
          "2 dias",
          "3 dias", 
          "4 dias",
          "5 dias"
        ],
        correctOption: 1,
        topic: "Raciocínio Lógico"
      }
    ]
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSelectOption = (index: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestion] = index;
    setSelectedOptions(newSelectedOptions);
  };
  
  const goToNextQuestion = () => {
    if (currentQuestion < simulado.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const finishSimulado = () => {
    setSimuladoFinished(true);
  };
  
  // Calculate results
  const calculateResults = () => {
    let correct = 0;
    simulado.questions.forEach((question, index) => {
      if (selectedOptions[index] === question.correctOption) {
        correct++;
      }
    });
    
    return {
      totalQuestions: simulado.questions.length,
      correctAnswers: correct,
      score: Math.round((correct / simulado.questions.length) * 100)
    };
  };
  
  const results = simuladoFinished ? calculateResults() : null;
  
  if (simuladoFinished) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/student/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
          </Button>
        </Link>
        
        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl">Resultados do Simulado</CardTitle>
            <p className="text-muted-foreground">{simulado.title}</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-primary-50 mb-4">
                <span className="text-3xl font-bold text-primary">{results?.score}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Você acertou {results?.correctAnswers} de {results?.totalQuestions} questões
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Desempenho por tópico:</h3>
              <div className="space-y-3">
                {["Direito Constitucional", "Direito Administrativo", "Português", "Direito Processual Civil", "Raciocínio Lógico"].map((topic, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{topic}</span>
                      <span>{[0, 100, 100, 0, 100][index]}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${[0, 100, 100, 0, 100][index]}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline">Ver gabarito</Button>
            <Link to="/student/dashboard">
              <Button>
                Voltar para Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const currentQuestionData = simulado.questions[currentQuestion];
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">{simulado.title}</h1>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mb-6">
        {simulado.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`h-10 w-10 flex items-center justify-center rounded-full border ${
              currentQuestion === index ? 'bg-primary text-white' : 
              selectedOptions[index] !== null ? 'bg-primary-50 border-primary' :
              'bg-white'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      
      <Card className="mb-6">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Questão {currentQuestion + 1} de {simulado.questions.length}
              </div>
              <CardTitle className="text-base">{currentQuestionData.content}</CardTitle>
            </div>
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              {currentQuestionData.topic}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {currentQuestionData.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <label 
                  className={`flex items-center gap-3 p-3 rounded-lg border w-full cursor-pointer transition-colors ${
                    selectedOptions[currentQuestion] === index ? 'bg-primary-50 border-primary' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectOption(index)}
                >
                  <div 
                    className={`flex items-center justify-center h-6 w-6 rounded-full border ${
                      selectedOptions[currentQuestion] === index ? 'border-primary bg-primary text-white' : 'border-gray-300'
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
          <Button 
            variant="outline" 
            onClick={goToPrevQuestion}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          
          {currentQuestion < simulado.questions.length - 1 ? (
            <Button onClick={goToNextQuestion}>
              Próxima
            </Button>
          ) : (
            <Button 
              onClick={finishSimulado}
              className="bg-green-600 hover:bg-green-700"
            >
              Finalizar Simulado
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>
          Atenção: Ao finalizar o simulado, você não poderá retornar para revisar ou alterar suas respostas.
        </span>
      </div>
    </div>
  );
}
