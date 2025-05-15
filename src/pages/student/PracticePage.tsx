// src/pages/student/PracticePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext'; // Para pegar studentId e o cargo ativo
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // shadcn/ui
import { toast } from '@/components/ui/sonner';

// Defina um tipo para a questão retornada pela RPC
interface PracticeQuestion {
  question_id: string;
  organ_name: string | null;
  position_name: string | null;
  source_year: number | null;
  banca_name: string | null;
  difficulty_level: number | null;
  reference_text: string | null;
  statement: string;
  reference_image_url: string | null;
  item_text: string | null; // Para questões de Certo/Errado onde o item é o texto a ser julgado
  item_a: string | null;
  item_b: string | null;
  item_c: string | null;
  item_d: string | null;
  item_e: string | null;
  question_style_name: string; // 'ME4', 'ME5', 'CE'
  correct_option: string;
  created_by_ai?: boolean;
}

// Tipos para filtros
interface Subject { id: string; name: string; } // Assumindo que a RPC retorna id e name
interface Topic { id: string; name: string; }   // Assumindo que a RPC retorna id e name

// Mock ID - SUBSTITUA ESTE VALOR POR UM UUID VÁLIDO DA SUA TABELA exam_positions
const MOCKED_EXAM_POSITION_ID = 'coloque-um-uuid-valido-de-exam_positions-aqui'; 

export default function PracticePage() {
  const { user, profile } = useAuth();
  const [currentExamPositionId, setCurrentExamPositionId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false); // Novo estado

  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // 1. Obtenção do currentExamPositionId (Mockado por enquanto)
  useEffect(() => {
    if (user) { // Simula que a seleção de cargo já foi feita ou é mockada
      // Em um cenário real, isso viria do perfil do usuário, de uma seleção na UI, etc.
      // Se profile.active_exam_position_id existisse e fosse confiável:
      // if (profile && profile.active_exam_position_id) {
      //   setCurrentExamPositionId(profile.active_exam_position_id);
      // } else {
      //   console.warn("ID do cargo do concurso ativo do aluno não definido, usando mock.");
      //   setCurrentExamPositionId(MOCKED_EXAM_POSITION_ID);
      // }
      console.log(`Usando MOCKED_EXAM_POSITION_ID: ${MOCKED_EXAM_POSITION_ID}`);
      setCurrentExamPositionId(MOCKED_EXAM_POSITION_ID);
    } else {
      setCurrentExamPositionId(null); // Limpa se não houver usuário
    }
  }, [user, profile]); // Adicionado profile como dependência, embora não usado diretamente no mock

  // 2. Implemente fetchSubjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!currentExamPositionId) {
        setSubjects([]);
        setSelectedSubjectId(null); // Limpa seleção de disciplina ao limpar cargo
        setTopics([]); // Limpa tópicos também
        setSelectedTopicId(null); // Limpa seleção de tópico
        return;
      }
      console.log(`[fetchSubjects] Buscando disciplinas para position_id: ${currentExamPositionId}`);
      setIsLoadingFilters(true);
      try {
        // Certifique-se que a RPC 'get_subjects_for_position' existe e aceita 'p_position_id'
        const { data, error } = await supabase.rpc('get_subjects_for_position', { 
          p_position_id: currentExamPositionId 
        });

        if (error) {
          console.error("Erro RPC ao buscar disciplinas:", error);
          throw error;
        }
        
        console.log("[fetchSubjects] Disciplinas recebidas:", data);
        setSubjects(data || []);
        // Não reseta selectedSubjectId aqui, pois pode já ter um valor válido se o cargo mudou
        // e a disciplina anterior ainda existe no novo conjunto.
        // Mas reseta os tópicos, pois eles dependem da disciplina.
        setTopics([]);
        setSelectedTopicId(null);

      } catch (err: any) {
        console.error("Erro ao buscar disciplinas (catch):", err.message);
        toast.error("Erro ao carregar disciplinas", { description: err.message });
        setSubjects([]);
        setTopics([]); // Limpa tópicos em caso de erro
        setSelectedTopicId(null);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    fetchSubjects();
  }, [currentExamPositionId]); // Dependência correta

  // 3. Implemente fetchTopics
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSubjectId) {
        setTopics([]);
        setSelectedTopicId(null); // Limpa seleção de tópico se a disciplina for desmarcada
        return;
      }
      console.log(`[fetchTopics] Buscando tópicos para subject_id: ${selectedSubjectId}`);
      setIsLoadingFilters(true);
      try {
        // Certifique-se que a RPC 'get_topics_for_subject' existe e aceita 'p_subject_id'
        const { data, error } = await supabase.rpc('get_topics_for_subject', { 
          p_subject_id: selectedSubjectId 
        });

        if (error) {
          console.error("Erro RPC ao buscar tópicos:", error);
          throw error;
        }
        console.log("[fetchTopics] Tópicos recebidos:", data);
        setTopics(data || []);
        setSelectedTopicId(null); // Reseta o tópico selecionado ao carregar novos tópicos

      } catch (err: any) {
        console.error("Erro ao buscar tópicos (catch):", err.message);
        toast.error("Erro ao carregar tópicos", { description: err.message });
        setTopics([]);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    
    fetchTopics();
  }, [selectedSubjectId]); // Dependência correta

  // Função para buscar nova questão (será chamada pelo botão)
  const fetchNewQuestion = useCallback(async () => {
    if (!user || !currentExamPositionId) {
      toast.info("Por favor, selecione um concurso/cargo para iniciar.");
      return;
    }
    setIsLoadingQuestion(true);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setFeedback('');
    console.log(`[fetchNewQuestion] Buscando questão para student_id: ${user.id}, position_id: ${currentExamPositionId}, subject_id: ${selectedSubjectId || null}, topic_id: ${selectedTopicId || null}`);
    try {
      const { data, error } = await supabase.rpc('get_random_practice_question', {
        p_student_id: user.id,
        p_exam_position_id: currentExamPositionId,
        p_subject_id: selectedSubjectId, // Envia null se não selecionado
        p_topic_id: selectedTopicId     // Envia null se não selecionado
      });

      if (error) {
        console.error("Erro RPC ao buscar questão:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("[fetchNewQuestion] Questão recebida:", data[0]);
        setCurrentQuestion(data[0]);
        setStartTime(Date.now());
      } else {
        console.log("[fetchNewQuestion] Nenhuma questão encontrada com os filtros atuais.");
        setCurrentQuestion(null);
        toast.info("Nenhuma questão encontrada com os filtros selecionados.");
      }
    } catch (err: any) {
      console.error("Erro ao buscar nova questão (catch):", err.message);
      toast.error("Erro ao carregar questão", { description: err.message });
      setCurrentQuestion(null);
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [user, currentExamPositionId, selectedSubjectId, selectedTopicId]);

  // Lógica de resposta (por enquanto, sem salvar no banco)
  const handleRespond = (answer: string) => {
    if (!currentQuestion) return;
    const endTime = Date.now();
    const timeSpent = startTime ? Math.round((endTime - startTime) / 1000) : 0; // em segundos

    setSelectedAnswer(answer);
    setShowAnswer(true);
    if (answer === currentQuestion.correct_option) {
      setFeedback(`Correto! Você levou ${timeSpent} segundos.`);
      // TODO: Lógica para contabilizar acerto
    } else {
      setFeedback(`Incorreto. A resposta correta era ${currentQuestion.correct_option}. Você levou ${timeSpent} segundos.`);
      // TODO: Lógica para contabilizar erro
    }
    // TODO: Salvar resposta no banco (student_answers) - será feito depois
    console.log(`Resposta dada: ${answer}, Correta: ${currentQuestion.correct_option}, Tempo: ${timeSpent}s`);
  };


  // JSX para renderizar a página
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Página de Prática</h1>

      {/* TODO: Adicionar Select para o aluno escolher o EXAM_POSITION_ID se não vier do profile */}
      <p className="mb-4">Concurso/Cargo Ativo ID: {currentExamPositionId || "Nenhum selecionado"}</p>

      {/* Dropdowns de Filtro */}
      <div className="flex space-x-4 mb-4">
        {/* Select de Disciplina */}
        <Select
          value={selectedSubjectId || ''}
          onValueChange={(value) => {
            console.log("Disciplina selecionada:", value);
            setSelectedSubjectId(value || null);
            //setSelectedTopicId(null); // Resetar tópico ao mudar disciplina já é feito no useEffect de fetchTopics
          }}
          disabled={isLoadingFilters || !currentExamPositionId || subjects.length === 0}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder={isLoadingFilters ? "Carregando..." : "Selecione a Disciplina"} />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
            {subjects.length === 0 && !isLoadingFilters && currentExamPositionId && <SelectItem value="no-subjects" disabled>Nenhuma disciplina encontrada</SelectItem>}
          </SelectContent>
        </Select>

        {/* Select de Tópico */}
        <Select
          value={selectedTopicId || ''}
          onValueChange={(value) => {
            console.log("Tópico selecionado:", value);
            setSelectedTopicId(value || null);
          }}
          disabled={isLoadingFilters || !selectedSubjectId || topics.length === 0}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder={isLoadingFilters ? "Carregando..." : "Selecione o Tópico (Opcional)"} />
          </SelectTrigger>
          <SelectContent>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
            {topics.length === 0 && !isLoadingFilters && selectedSubjectId && <SelectItem value="no-topics" disabled>Nenhum tópico encontrado</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {/* Botão para buscar questão */}
      <Button onClick={fetchNewQuestion} disabled={isLoadingQuestion || !currentExamPositionId}>
        {isLoadingQuestion ? "Carregando Questão..." : (currentQuestion ? "Próxima Questão" : "Iniciar Prática")}
      </Button>

      {/* Área da Questão */}
      {currentQuestion && (
        <div className="mt-6 p-4 border rounded-lg">
          <p className="text-sm text-gray-500 mb-2">
            {currentQuestion.organ_name && `${currentQuestion.organ_name} `}
            {currentQuestion.position_name && `/ ${currentQuestion.position_name} `}
            {currentQuestion.source_year && `/ ${currentQuestion.source_year} `}
            {currentQuestion.banca_name && `/ Banca: ${currentQuestion.banca_name}`}
          </p>
          {currentQuestion.reference_text && <div className="mb-2 p-2 bg-gray-100 rounded" dangerouslySetInnerHTML={{ __html: currentQuestion.reference_text }} />}
          {currentQuestion.reference_image_url && <img src={currentQuestion.reference_image_url} alt="Referência da questão" className="mb-2 max-w-full h-auto" />}
          
          <div className="mb-4" dangerouslySetInnerHTML={{ __html: currentQuestion.statement }} />

          {/* Lógica de renderização de alternativas baseada no estilo */}
          {currentQuestion.question_style_name === 'CE' && currentQuestion.item_text && (
            <div className="space-y-2">
              <p className="mb-2">Julgue o item abaixo:</p>
              <div className="p-2 border rounded" dangerouslySetInnerHTML={{__html: currentQuestion.item_text}} />
              <Button onClick={() => handleRespond('C')} variant={selectedAnswer === 'C' ? "default" : "outline"} disabled={showAnswer} className="mr-2">Certo</Button>
              <Button onClick={() => handleRespond('E')} variant={selectedAnswer === 'E' ? "default" : "outline"} disabled={showAnswer}>Errado</Button>
            </div>
          )}

          {(currentQuestion.question_style_name === 'ME4' || currentQuestion.question_style_name === 'ME5') && (
            <div className="space-y-2">
              {currentQuestion.item_a && <Button onClick={() => handleRespond('A')} variant={selectedAnswer === 'A' ? "default" : "outline"} disabled={showAnswer} className="block w-full text-left">A) {currentQuestion.item_a}</Button>}
              {currentQuestion.item_b && <Button onClick={() => handleRespond('B')} variant={selectedAnswer === 'B' ? "default" : "outline"} disabled={showAnswer} className="block w-full text-left">B) {currentQuestion.item_b}</Button>}
              {currentQuestion.item_c && <Button onClick={() => handleRespond('C')} variant={selectedAnswer === 'C' ? "default" : "outline"} disabled={showAnswer} className="block w-full text-left">C) {currentQuestion.item_c}</Button>}
              {currentQuestion.item_d && <Button onClick={() => handleRespond('D')} variant={selectedAnswer === 'D' ? "default" : "outline"} disabled={showAnswer} className="block w-full text-left">D) {currentQuestion.item_d}</Button>}
              {currentQuestion.question_style_name === 'ME5' && currentQuestion.item_e && <Button onClick={() => handleRespond('E')} variant={selectedAnswer === 'E' ? "default" : "outline"} disabled={showAnswer} className="block w-full text-left">E) {currentQuestion.item_e}</Button>}
            </div>
          )}

          {showAnswer && (
            <div className={`mt-4 p-2 rounded ${feedback.includes('Correto') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {feedback}
            </div>
          )}
        </div>
      )}
      {!currentQuestion && !isLoadingQuestion && <p className="mt-4">Clique em "Iniciar Prática" ou "Próxima Questão" para começar.</p>}
    </div>
  );
}