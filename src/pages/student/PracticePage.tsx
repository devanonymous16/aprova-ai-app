// src/pages/student/PracticePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentFocus, LinkedPosition } from '@/contexts/StudentFocusContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  // CardTitle, // Removida se não estiver em uso explícito
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Interface para a questão
interface PracticeQuestion {
  question_id: string;
  organ_name: string | null;
  position_name: string | null;
  source_year: number | null;
  banca_name: string | null;
  difficulty_level: number | null; // 1-5
  reference_text: string | null;
  statement: string;
  reference_image_url: string | null;
  item_text: string | null;
  item_a: string | null;
  item_b: string | null;
  item_c: string | null;
  item_d: string | null;
  item_e: string | null;
  question_style_name: string;
  correct_option: string;
  created_by_ai?: boolean;
  ai_thread_id?: string | null;
  explanation_general?: string | null;
  explanation_a?: string | null;
  explanation_b?: string | null;
  explanation_c?: string | null;
  explanation_d?: string | null;
  explanation_e?: string | null;
}

// Tipos para filtros
interface Subject { id: string; name: string; }
interface Topic { id: string; name: string; }

// Tipo esperado da resposta do N8N
interface N8NQuestionOutput {
  generatedbyai: "sim" | "não";
  examtype?: string;
  organization?: string;
  position?: string;
  area?: string;
  subject?: string;
  topic?: string;
  subtopic?: string | null;
  examboard?: string;
  difficultylevel?: string; // "Elementar", "Fácil", "Moderado", "Difícil", "Desafiador"
  educationlevel?: string;
  questionstyle?: "ME4" | "ME5" | "CE";
  referencetext?: string | null;
  statement: string;
  A?: string | null;
  B?: string | null;
  C?: string | null;
  D?: string | null;
  E?: string | null;
  correct_answer: string;
}

// Mapas de dificuldade
const difficultyLevelMapReverse: { [key: string]: number } = { "Elementar": 1, "Fácil": 2, "Moderado": 3, "Difícil": 4, "Desafiador": 5 };
const difficultyMapForAI: { [key: number]: string } = { 1: "Elementar", 2: "Fácil", 3: "Moderado", 4: "Difícil", 5: "Desafiador" };
const difficultyMapRender: { [key: number]: string } = { 1: "Elementar", 2: "Fácil", 3: "Moderado", 4: "Difícil", 5: "Desafiador" };


export default function PracticePage() {
  const { user } = useAuth();
  const { 
    currentActiveExamPositionId,
    linkedPositions,
    isLoadingFocus: isLoadingFocusContext 
  } = useStudentFocus();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isLoadingPageFilters, setIsLoadingPageFilters] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [isLoadingBankQuestion, setIsLoadingBankQuestion] = useState(false);
  const [isLoadingAiQuestion, setIsLoadingAiQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [currentFocusDetails, setCurrentFocusDetails] = useState<LinkedPosition | null | undefined>(null);

  useEffect(() => {
    if (currentActiveExamPositionId && linkedPositions) {
      const focus = linkedPositions.find(p => p.exam_position_id === currentActiveExamPositionId);
      // Evita re-setar desnecessariamente se o foco já for o correto
      if (currentFocusDetails?.exam_position_id !== focus?.exam_position_id || !currentFocusDetails) {
        setCurrentFocusDetails(focus);
        setSelectedSubjectId(null); 
        setSelectedTopicId(null);
        setCurrentQuestion(null);
        setShowAnswer(false);
      }
    } else {
      setCurrentFocusDetails(null);
    }
    if (!isLoadingFocusContext && !currentActiveExamPositionId && user && linkedPositions !== null ) {
      if (linkedPositions.length > 0) {
        toast.info("Nenhum concurso selecionado.", { description: "Escolha um foco no seu Dashboard para praticar.", duration: 5000 });
      } else {
        toast.info("Você não está vinculado a nenhum concurso.", { description: "Explore e escolha um para começar.", duration: 5000 });
      }
    }
  }, [currentActiveExamPositionId, user, linkedPositions, isLoadingFocusContext, currentFocusDetails]);

  useEffect(() => { 
    const fetchSubjects = async () => {
      if (!currentActiveExamPositionId) { setSubjects([]); setSelectedSubjectId(null); setTopics([]); setSelectedTopicId(null); return; }
      setIsLoadingPageFilters(true);
      try {
        const { data, error } = await supabase.rpc('get_subjects_for_position', { p_position_id: currentActiveExamPositionId });
        if (error) throw error;
        setSubjects(data || []); 
        // Não resetar selectedTopicId aqui, pois fetchTopics será chamado se selectedSubjectId já tiver um valor
      } catch (err: any) { toast.error("Erro ao carregar disciplinas", { description: err.message }); setSubjects([]); setSelectedSubjectId(null); setTopics([]); setSelectedTopicId(null);
      } finally { setIsLoadingPageFilters(false); }
    };
    if(currentActiveExamPositionId) { fetchSubjects(); } else { setSubjects([]); setSelectedSubjectId(null); setTopics([]); setSelectedTopicId(null); }
  }, [currentActiveExamPositionId]);

  useEffect(() => { 
    const fetchTopics = async () => {
      if (!selectedSubjectId) { setTopics([]); setSelectedTopicId(null); return; } // Limpa tópicos se disciplina for desmarcada
      setIsLoadingPageFilters(true);
      try {
        const { data, error } = await supabase.rpc('get_topics_for_subject', { p_subject_id: selectedSubjectId });
        if (error) throw error;
        setTopics(data || []); 
        setSelectedTopicId(null); // Reseta o tópico ao carregar novos tópicos para a disciplina
      } catch (err: any) { toast.error("Erro ao carregar tópicos", { description: err.message }); setTopics([]); setSelectedTopicId(null);
      } finally { setIsLoadingPageFilters(false); }
    };
    if(selectedSubjectId) { fetchTopics(); } else { setTopics([]); setSelectedTopicId(null); }
  }, [selectedSubjectId]);

  const fetchBankQuestion = useCallback(async () => { 
    console.log('[PracticePage DEBUG] Botão "Buscar Banco de Questões" CLICADO'); 
    if (!user?.id || !currentActiveExamPositionId) { 
        toast.info("Selecione um concurso de foco."); 
        return; 
    }
    setIsLoadingBankQuestion(true); 
    setIsLoadingAiQuestion(false);
    setCurrentQuestion(null); 
    setShowAnswer(false); 
    setSelectedAnswer(null); 
    setFeedback('');
    console.log(`[PracticePage - fetchBankQuestion] Buscando questão para student: ${user.id}, position: ${currentActiveExamPositionId}, subject: ${selectedSubjectId || 'any'}, topic: ${selectedTopicId || 'any'}`);
    try {
      const { data, error } = await supabase.rpc('get_random_practice_question', {
        p_student_id: user.id, 
        p_exam_position_id: currentActiveExamPositionId,
        p_subject_id: selectedSubjectId, 
        p_topic_id: selectedTopicId
      });
      if (error) {
        console.error("Erro RPC ao buscar questão do banco:", error);
        throw error;
      }
      if (data && data.length > 0) { 
        console.log("[PracticePage - fetchBankQuestion] Questão do banco recebida:", data[0]);
        setCurrentQuestion(data[0] as PracticeQuestion);
        setStartTime(Date.now()); 
      } else { 
        setCurrentQuestion(null); 
        toast.info("Nenhuma questão encontrada no banco para estes filtros."); 
      }
    } catch (err: any) { 
      console.error("Erro ao carregar questão do banco (catch):", err.message);
      toast.error("Erro ao carregar questão do banco", { description: err.message }); 
      setCurrentQuestion(null);
    } finally { 
      setIsLoadingBankQuestion(false); 
    }
  }, [user, currentActiveExamPositionId, selectedSubjectId, selectedTopicId]);

  // << ======================= INÍCIO generateAiQuestion MODIFICADA ======================= >>
  const generateAiQuestion = useCallback(async () => { 
    console.log('[PracticePage DEBUG] Botão "Gerar Questão Inédita" CLICADO');
    if (!user?.id || !currentActiveExamPositionId || !currentFocusDetails) {
        toast.error("Erro de Configuração", { description: "Concurso ou cargo em foco não está definido corretamente. Selecione um foco no seu dashboard." }); 
        return;
    }
    // Lógica de Permissão: Não FREE (já estava no seu código)
    if (currentFocusDetails.access_type === 'free') {
        toast.info("Recurso Indisponível", { description: "Questões inéditas com IA são para planos pagantes ou alunos de organizações." });
        return;
    }

    setIsLoadingAiQuestion(true); 
    setIsLoadingBankQuestion(false);
    setCurrentQuestion(null); 
    setShowAnswer(false); 
    setSelectedAnswer(null); 
    setFeedback('');
    console.log(`[PracticePage - generateAiQuestion] Solicitando questão IA para position: ${currentActiveExamPositionId}, subject: ${selectedSubjectId}, topic: ${selectedTopicId}`);
    
    try {
        let exampleQuestionForAI: PracticeQuestion | null = null;
        // Tenta buscar uma questão exemplo se filtros de disciplina ou tópico estiverem ativos
        if (selectedSubjectId || selectedTopicId) { 
            const { data: exampleData, error: exampleError } = await supabase.rpc('get_random_practice_question', {
                p_student_id: user.id, p_exam_position_id: currentActiveExamPositionId,
                p_subject_id: selectedSubjectId, p_topic_id: selectedTopicId
            });
            if (exampleError) {
                console.warn("[PracticePage - generateAiQuestion] Não foi possível buscar questão exemplo:", exampleError.message);
            }
            if (exampleData && exampleData.length > 0) {
                exampleQuestionForAI = exampleData[0] as PracticeQuestion;
                console.log("[PracticePage - generateAiQuestion] Usando questão exemplo:", exampleQuestionForAI);
            }
        }
        
        const selectedSubjectName = subjects.find(s => s.id === selectedSubjectId)?.name;
        const selectedTopicName = topics.find(t => t.id === selectedTopicId)?.name;

        // --- Completar o chatInputPayload ---
        const organName = exampleQuestionForAI?.organ_name || currentFocusDetails?.organ_name || "Concurso Público Geral";
        const positionName = currentFocusDetails?.position_name || "Cargo Específico";
        const bancaName = exampleQuestionForAI?.banca_name || currentFocusDetails?.banca_name || "Banca Elaboradora";
        const educationLevel = currentFocusDetails?.education_level_name || "Nível Superior";
        const questionStyleForPayload = exampleQuestionForAI?.question_style_name || "ME5"; // Default para Múltipla Escolha com 5 opções
        const difficultyLevelForPayload = exampleQuestionForAI?.difficulty_level 
                                          ? difficultyMapForAI[exampleQuestionForAI.difficulty_level] 
                                          : "Moderado";
        
        const chatInputPayload: any = {
            exam_type: organName, 
            orgao: organName,
            cargo: positionName,
            estilo: questionStyleForPayload,
            nivel_escolaridade: educationLevel,
            banca: bancaName,
            grau_dificuldade: difficultyLevelForPayload,
            // Só envia subject/topic se estiverem selecionados
            subject: selectedSubjectId && selectedSubjectName ? { name: selectedSubjectName } : undefined,
            topic: selectedTopicId && selectedTopicName ? { name: selectedTopicName } : undefined,
            subtopic: undefined, 
            example_question: exampleQuestionForAI ? { 
                statement: exampleQuestionForAI.statement,
                item_text: exampleQuestionForAI.item_text, 
                item_a: exampleQuestionForAI.item_a, item_b: exampleQuestionForAI.item_b,
                item_c: exampleQuestionForAI.item_c, item_d: exampleQuestionForAI.item_d,
                item_e: exampleQuestionForAI.item_e, 
                correct_option: exampleQuestionForAI.correct_option,
                reference_text: exampleQuestionForAI.reference_text,
                question_style_name: exampleQuestionForAI.question_style_name,
            } : undefined,
        };
        Object.keys(chatInputPayload).forEach(key => chatInputPayload[key] === undefined && delete chatInputPayload[key]);
        // --- Fim Completar o chatInputPayload ---

        const requestBody = [{ threadId: currentQuestion?.ai_thread_id || null, chatInput: JSON.stringify(chatInputPayload) }];
        console.log("[PracticePage - generateAiQuestion] Enviando para N8N:", JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://n8n.aprova-ai.com/webhook/21e7767b-dab2-4a1b-9b66-ad30a2608872', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[PracticePage - generateAiQuestion] Erro na resposta do N8N:", response.status, errorText);
            throw new Error(`Erro do N8N ${response.status}: ${errorText || response.statusText}`);
        }
        
        const aiFullResponse = await response.json();
        
        // --- Processar a Resposta do N8N Corretamente ---
        if (!aiFullResponse || !Array.isArray(aiFullResponse) || aiFullResponse.length === 0 || !aiFullResponse[0].output || !aiFullResponse[0].threadId) { 
            console.error("[PracticePage - generateAiQuestion] Resposta da IA (N8N) em formato inesperado:", aiFullResponse);
            throw new Error("Resposta da IA (N8N) em formato inesperado, vazia ou sem threadId.");
        }
        
        const parsedOutput = JSON.parse(aiFullResponse[0].output);
        const aiQuestionDataFromN8N = parsedOutput.format1 as N8NQuestionOutput; 
        const threadId = aiFullResponse[0].threadId;
        
        console.log("[PracticePage - generateAiQuestion] Dados da IA processados:", aiQuestionDataFromN8N, "Thread:", threadId);
        
        const newAiQuestion: PracticeQuestion = {
            question_id: `ai-${threadId}`, 
            statement: aiQuestionDataFromN8N.statement,
            item_a: aiQuestionDataFromN8N.A || null,
            item_b: aiQuestionDataFromN8N.B || null,
            item_c: aiQuestionDataFromN8N.C || null,
            item_d: aiQuestionDataFromN8N.D || null,
            item_e: aiQuestionDataFromN8N.E || null,
            item_text: aiQuestionDataFromN8N.questionstyle === 'CE' ? (aiQuestionDataFromN8N.A || aiQuestionDataFromN8N.statement || "Item CE não fornecido") : null, 
            correct_option: aiQuestionDataFromN8N.correct_answer,
            question_style_name: aiQuestionDataFromN8N.questionstyle || 'ME5', 
            organ_name: aiQuestionDataFromN8N.organization || chatInputPayload.orgao,
            position_name: aiQuestionDataFromN8N.position || chatInputPayload.cargo,
            banca_name: aiQuestionDataFromN8N.examboard || `IA (${chatInputPayload.banca || 'Genérica'})`,
            source_year: new Date().getFullYear(),
            difficulty_level: aiQuestionDataFromN8N.difficultylevel ? difficultyLevelMapReverse[aiQuestionDataFromN8N.difficultylevel] : 3,
            reference_text: aiQuestionDataFromN8N.referencetext || null,
            reference_image_url: null, 
            created_by_ai: true,
            ai_thread_id: threadId,
        };
        // --- Fim Processar a Resposta do N8N Corretamente ---
        setCurrentQuestion(newAiQuestion);
        setStartTime(Date.now());

      // Salvar questão gerada por IA no banco
      console.log("[PracticePage - generateAiQuestion] Tentando salvar questão IA no banco:", newAiQuestion);
      // Busca o ID do estilo da questão pelo nome retornado pela IA
      let questionStyleIdToSave: string | null = null;
      if (newAiQuestion.question_style_name) {
        const { data: styleData, error: styleError } = await supabase
          .from('exam_styles')
          .select('id')
          .eq('name', newAiQuestion.question_style_name)
          .single();
        if (styleError) console.warn(`[PracticePage - generateAiQuestion] Estilo de questão '${newAiQuestion.question_style_name}' não encontrado no banco:`, styleError.message);
        questionStyleIdToSave = styleData?.id || null;
      }

      const { error: insertError } = await supabase.from('questions').insert({
        statement: newAiQuestion.statement,
        item_text: newAiQuestion.item_text,
        item_a: newAiQuestion.item_a, item_b: newAiQuestion.item_b, item_c: newAiQuestion.item_c, item_d: newAiQuestion.item_d, item_e: newAiQuestion.item_e,
        correct_option: newAiQuestion.correct_option,
        exam_subject_id: selectedSubjectId, 
        exam_topic_id: selectedTopicId,     
        exam_position_id: currentActiveExamPositionId, 
        question_style_id: questionStyleIdToSave,
        // --- Usar novos campos de currentFocusDetails para institution e banca ---
        exam_institution_id: currentFocusDetails?.organ_id || null, 
        exam_banca_id: currentFocusDetails?.banca_id || null,       
        source_year: newAiQuestion.source_year,
        difficulty_level: newAiQuestion.difficulty_level,
        created_by_ai: true,
        ai_thread_id: newAiQuestion.ai_thread_id,
        origin_user: user.id // Coluna é 'origin_user' na sua tabela questions
      });

      if (insertError) {
        console.error("Erro ao salvar questão IA no banco:", insertError);
        toast.error("Erro ao salvar questão gerada", {description: "A questão foi gerada mas não pôde ser salva. Você ainda pode respondê-la."});
      } else {
        console.log("Questão IA salva no banco de dados. Thread ID (usado como parte do ID temporário):", newAiQuestion.ai_thread_id);
        toast.success("Questão inédita gerada e salva!");
      }
    } catch (err: any) {
      console.error("Erro ao gerar questão com IA (catch):", err.message);
      toast.error("Erro ao gerar questão inédita", { description: err.message });
      setCurrentQuestion(null);
    } finally {
        setIsLoadingAiQuestion(false); 
    }
  }, [user, currentActiveExamPositionId, currentFocusDetails, subjects, topics, selectedSubjectId, selectedTopicId, currentQuestion]); // Adicionado currentQuestion se ai_thread_id é usado no payload
  // << ======================= FIM generateAiQuestion MODIFICADA ======================= >>
  
  const handleRespond = (answer: string) => { 
    if (!currentQuestion) return;
    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    setSelectedAnswer(answer); setShowAnswer(true);
    const isCorrect = answer === currentQuestion.correct_option;
    setFeedback(isCorrect ? `Correto! (${timeSpent}s)` : `Incorreto. Gabarito: ${currentQuestion.correct_option}. (${timeSpent}s)`);
    console.log(`[PracticePage - handleRespond] Resposta: ${answer}, Gabarito: ${currentQuestion.correct_option}, Tempo: ${timeSpent}s`);
    // TODO: Salvar a resposta do usuário na tabela student_answers
    // (Isso seria uma nova função, ex: saveAnswerAttempt)
  };

  const canGenerateAiQuestion = currentFocusDetails?.access_type !== 'free';

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Button variant="outline" onClick={() => navigate('/dashboard/student')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Button>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">Resolver Questões</h1>
      
      <div className="mb-6 text-md md:text-lg">
        {isLoadingFocusContext && <Skeleton className="h-6 w-3/4 my-1" /> }
        {!isLoadingFocusContext && currentActiveExamPositionId && currentFocusDetails ? (
          <div className="flex items-center gap-x-3 flex-wrap">
            <span>Cargo em Foco: <span className="font-semibold">{currentFocusDetails.position_name}</span></span>
            {currentFocusDetails.overall_exam_status && (
              <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                currentFocusDetails.overall_exam_status.toLowerCase().includes('andamento') ? 'bg-green-100 text-green-700' :
                currentFocusDetails.overall_exam_status.toLowerCase().includes('previsto') ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                Edital: {currentFocusDetails.overall_exam_status}
              </span>
            )}
          </div>
        ) : (
          !isLoadingFocusContext && <p className="text-red-500">Nenhum concurso selecionado. Volte ao Dashboard e escolha um foco.</p>
        )}
      </div>
      
      {currentActiveExamPositionId && (
        <>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Select
              value={selectedSubjectId || ''}
              onValueChange={(value) => {
                setSelectedSubjectId(value === 'all' || !value ? null : value);
                //setSelectedTopicId(null); // Resetar tópico já é feito no useEffect de fetchTopics
              }}
              disabled={isLoadingPageFilters || !subjects || subjects.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder={isLoadingPageFilters ? "Carregando..." : "Filtrar por Disciplina"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Disciplinas</SelectItem>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
                {(!subjects || subjects.length === 0) && !isLoadingPageFilters && <SelectItem value="no-subjects" disabled>Nenhuma disciplina</SelectItem>}
              </SelectContent>
            </Select>

            <Select
              value={selectedTopicId || ''}
              onValueChange={(value) => setSelectedTopicId(value === 'all' || !value ? null : value)}
              disabled={isLoadingPageFilters || !selectedSubjectId || !topics || topics.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder={isLoadingPageFilters && selectedSubjectId ? "Carregando..." : "Filtrar por Tópico"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tópicos</SelectItem>
                {topics?.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
                {(!topics || topics.length === 0) && !isLoadingPageFilters && selectedSubjectId && <SelectItem value="no-topics" disabled>Nenhum tópico</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Button 
              onClick={fetchBankQuestion} 
              disabled={isLoadingBankQuestion || isLoadingAiQuestion} 
              className="w-full py-3 text-base"
              size="lg"
            >
                <Activity className="mr-2 h-5 w-5" />
                {isLoadingBankQuestion ? "Buscando Questão..." : "Buscar no Banco"}
            </Button>
            <Button 
                onClick={generateAiQuestion} 
                disabled={isLoadingAiQuestion || isLoadingBankQuestion || !canGenerateAiQuestion} 
                variant={canGenerateAiQuestion ? "default" : "outline"}
                className="w-full py-3 text-base"
                size="lg"
                title={!canGenerateAiQuestion ? "Disponível para planos pagos ou alunos de organizações" : "Gerar questão inédita com IA"}
            >
                <Sparkles className="mr-2 h-5 w-5" />
                {isLoadingAiQuestion ? "Gerando com IA..." : "Gerar Inédita (IA)"}
            </Button>
          </div>
        </>
      )}

      {(isLoadingBankQuestion || isLoadingAiQuestion) && (
        <div className="text-center py-10">
            <div role="status" className="flex flex-col items-center">
                <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <p className="mt-3 text-muted-foreground">Buscando uma nova questão para você...</p>
            </div>
        </div>
      )}

      {!isLoadingBankQuestion && !isLoadingAiQuestion && currentQuestion && (
        <Card className="mt-6">
          <CardHeader>
            <div className="text-xs text-muted-foreground mb-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 gap-y-1">
              {currentQuestion.organ_name && <span className="truncate">Órgão: {currentQuestion.organ_name}</span>}
              {currentQuestion.position_name && <span className="truncate sm:before:content-['/'] sm:before:mx-1">Cargo: {currentQuestion.position_name}</span>}
              {currentQuestion.source_year && <span className="sm:before:content-['/'] sm:before:mx-1">Ano: {currentQuestion.source_year}</span>}
              {currentQuestion.banca_name && <span className="truncate sm:before:content-['/'] sm:before:mx-1">Banca: {currentQuestion.banca_name}</span>}
              {currentQuestion.difficulty_level && (
                <span className={`ml-0 sm:ml-auto mt-1 sm:mt-0 px-2 py-0.5 text-xs font-medium rounded-full inline-block ${
                    currentQuestion.difficulty_level <= 2 ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty_level === 3 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    {difficultyMapRender[currentQuestion.difficulty_level] || 'Não definida'}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestion.reference_text && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm prose max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1" 
                   dangerouslySetInnerHTML={{ __html: currentQuestion.reference_text }} />
            )}
            
            <div className="mb-4 prose max-w-none prose-sm sm:prose-base prose-p:my-2 prose-ul:my-2 prose-ol:my-2" 
                 dangerouslySetInnerHTML={{ __html: currentQuestion.statement }} />

            {currentQuestion.reference_image_url && (
              <img src={currentQuestion.reference_image_url} alt="Referência da questão" className="my-4 max-w-md mx-auto h-auto rounded-md shadow-sm" />
            )}

            <div className="space-y-3">
              {currentQuestion.question_style_name === 'CE' && currentQuestion.item_text && (
                <div className="p-3 border rounded-md bg-amber-50/60">
                  <p className="mb-3 font-medium text-amber-900">Julgue o item a seguir:</p>
                  <div className="prose prose-sm sm:prose-base max-w-none prose-p:my-1" dangerouslySetInnerHTML={{__html: currentQuestion.item_text}} />
                  <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button onClick={() => handleRespond('C')} variant={selectedAnswer === 'C' && showAnswer ? "default" : "outline"} disabled={showAnswer} className="flex-1">Certo</Button>
                    <Button onClick={() => handleRespond('E')} variant={selectedAnswer === 'E' && showAnswer ? "default" : "outline"} disabled={showAnswer} className="flex-1">Errado</Button>
                  </div>
                </div>
              )}

              {(currentQuestion.question_style_name === 'ME4' || currentQuestion.question_style_name === 'ME5') && (
                <>
                  {[
                    { label: 'A', item: currentQuestion.item_a },
                    { label: 'B', item: currentQuestion.item_b },
                    { label: 'C', item: currentQuestion.item_c },
                    { label: 'D', item: currentQuestion.item_d },
                    ...(currentQuestion.question_style_name === 'ME5' && currentQuestion.item_e ? [{ label: 'E', item: currentQuestion.item_e }] : []),
                  ].filter(alt => alt.item !== null && alt.item !== undefined).map((alt) => (
                    <Button 
                      key={alt.label} 
                      onClick={() => handleRespond(alt.label)} 
                      variant={(selectedAnswer === alt.label && showAnswer) ? (currentQuestion.correct_option === alt.label ? "default" : "destructive") : (showAnswer && currentQuestion.correct_option === alt.label ? "secondary" : "outline") } 
                      disabled={showAnswer} 
                      className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal hover:bg-slate-50"
                    >
                      <span className="font-semibold mr-2">{alt.label})</span> 
                      <div className="prose-sm sm:prose-base max-w-none prose-p:inline" dangerouslySetInnerHTML={{ __html: alt.item! }} />
                    </Button>
                  ))}
                </>
              )}
            </div>

            {showAnswer && (
              <div className={`mt-6 p-3 rounded-md text-sm font-medium ${feedback.includes('Correto') ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-red-100 border border-red-300 text-red-700'}`}>
                <p className="font-bold">{feedback.includes('Correto') ? "Resposta Correta!" : "Resposta Incorreta."}</p>
                <p>{feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoadingBankQuestion && !isLoadingAiQuestion && !currentQuestion && currentActiveExamPositionId && (
        <p className="mt-6 text-center text-muted-foreground">
          Selecione filtros e clique em "Buscar no Banco" ou "Gerar Inédita (IA)".
        </p>
      )}
    </div>
  );
}