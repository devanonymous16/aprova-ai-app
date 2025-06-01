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
  // CardTitle, // Não explicitamente usada no Card da questão, mas importada
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Interface para a questão
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
interface Subject { 
  subject_id: string; 
  subject_name: string; 
  area_id: string;    
  area_name: string;  
}
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
  difficultylevel?: string;
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
      if (currentFocusDetails?.exam_position_id !== focus?.exam_position_id || (!currentFocusDetails && focus)) {
        setCurrentFocusDetails(focus); setSelectedSubjectId(null); setSelectedTopicId(null); setCurrentQuestion(null); setShowAnswer(false);
      }
    } else { setCurrentFocusDetails(null); }
    if (!isLoadingFocusContext && !currentActiveExamPositionId && user && linkedPositions !== null ) {
      if (linkedPositions.length > 0) { toast.info("Nenhum concurso selecionado.", { description: "Escolha um foco no seu Dashboard para praticar.", duration: 5000 }); } 
      else { toast.info("Você não está vinculado a nenhum concurso.", { description: "Explore e escolha um para começar.", duration: 5000 }); }
    }
  }, [currentActiveExamPositionId, user, linkedPositions, isLoadingFocusContext, currentFocusDetails]);

  useEffect(() => { 
    const fetchSubjects = async () => {
      if (!currentActiveExamPositionId) { setSubjects([]); setSelectedSubjectId(null); setTopics([]); setSelectedTopicId(null); return; }
      setIsLoadingPageFilters(true);
      try {
        const { data, error } = await supabase.rpc('get_subjects_for_position', { p_position_id: currentActiveExamPositionId });
        if (error) throw error;
        setSubjects(data as Subject[] || []); setTopics([]); setSelectedTopicId(null);
      } catch (err: any) { toast.error("Erro ao carregar disciplinas", { description: err.message }); setSubjects([]); setSelectedSubjectId(null); setTopics([]); setSelectedTopicId(null);
      } finally { setIsLoadingPageFilters(false); }
    };
    fetchSubjects();
  }, [currentActiveExamPositionId]);

  useEffect(() => { 
    const fetchTopics = async () => {
      if (!selectedSubjectId) { setTopics([]); setSelectedTopicId(null); return; }
      setIsLoadingPageFilters(true);
      try {
        const { data, error } = await supabase.rpc('get_topics_for_subject', { p_subject_id: selectedSubjectId });
        if (error) throw error;
        setTopics(data || []); setSelectedTopicId(null); 
      } catch (err: any) { toast.error("Erro ao carregar tópicos", { description: err.message }); setTopics([]); setSelectedTopicId(null);
      } finally { setIsLoadingPageFilters(false); }
    };
    fetchTopics();
  }, [selectedSubjectId]);

  const fetchBankQuestion = useCallback(async () => { 
    console.log('[PracticePage DEBUG] Botão "Buscar Banco de Questões" CLICADO'); 
    if (!user?.id || !currentActiveExamPositionId || !currentFocusDetails?.banca_id ) { 
      toast.info("Faltam dados do foco: Banca não definida para o cargo atual."); 
      console.error("Dados de foco ausentes para fetchBankQuestion:", { currentActiveExamPositionId, currentFocusDetails });
      return; 
    }
    setIsLoadingBankQuestion(true); setIsLoadingAiQuestion(false); setCurrentQuestion(null); setShowAnswer(false); setSelectedAnswer(null); setFeedback('');
    
    const paramsForRpc = {
        p_student_id: user.id, 
        p_exam_position_id: currentActiveExamPositionId,
        // p_banca_id_foco: currentFocusDetails.banca_id, // Se a RPC filtrar por banca
        // p_education_level_id_foco: currentFocusDetails.education_level_id, // Se a RPC filtrar por nível
        p_subject_id: selectedSubjectId, 
        p_topic_id: selectedTopicId
    };
    console.log("[PracticePage - fetchBankQuestion] Parâmetros para RPC get_random_practice_question:", paramsForRpc);
    try {
      const { data, error } = await supabase.rpc('get_random_practice_question', paramsForRpc);
      if (error) { console.error("Erro RPC ao buscar questão do banco:", error); throw error; }
      if (data && data.length > 0) { setCurrentQuestion(data[0] as PracticeQuestion); setStartTime(Date.now()); } 
      else { setCurrentQuestion(null); toast.info("Nenhuma questão encontrada no banco para estes filtros e critérios."); }
    } catch (err: any) { toast.error("Erro ao carregar questão do banco", { description: err.message }); setCurrentQuestion(null);
    } finally { setIsLoadingBankQuestion(false); }
  }, [user, currentActiveExamPositionId, currentFocusDetails, selectedSubjectId, selectedTopicId]);
  
  const generateAiQuestion = useCallback(async () => { 
    console.log('[PracticePage DEBUG] Botão "Gerar Questão Inédita" CLICADO');
    if (!user?.id || !currentActiveExamPositionId || !currentFocusDetails || !currentFocusDetails.banca_name ) { // Checa banca_name para o payload
      toast.error("Erro de Configuração", { description: "Detalhes do concurso em foco (como Banca) não estão definidos." }); 
      console.error("generateAiQuestion: currentFocusDetails incompleto:", currentFocusDetails);
      return;
    }
    if (currentFocusDetails.access_type === 'free') {
        toast.info("Recurso Indisponível", { description: "Questões inéditas com IA são para planos pagantes ou alunos de organizações." });
        return;
    }
  
    setIsLoadingAiQuestion(true); setIsLoadingBankQuestion(false); setCurrentQuestion(null); setShowAnswer(false); setSelectedAnswer(null); setFeedback('');
    console.log(`[PracticePage - generateAiQuestion] Solicitando questão IA para position: ${currentActiveExamPositionId}`);
    
    try {
        let exampleQuestionForAI: PracticeQuestion | null = null;
        if (selectedSubjectId || selectedTopicId) { 
          const paramsForExampleRpc = {
            p_student_id: user.id, p_exam_position_id: currentActiveExamPositionId,
            p_subject_id: selectedSubjectId, p_topic_id: selectedTopicId,
            p_exclude_question_ids: [] // Pode adicionar lógica de exclusão aqui depois
          };
          const { data: exampleData, error: exampleError } = await supabase.rpc('get_random_practice_question', paramsForExampleRpc);
          if (exampleError) { console.warn("[PracticePage] Não foi possível buscar questão exemplo:", exampleError.message); } 
          else if (exampleData && exampleData.length > 0) { exampleQuestionForAI = exampleData[0] as PracticeQuestion; console.log("[PracticePage] Usando questão exemplo:", exampleQuestionForAI); } 
          else { console.log("[PracticePage] Nenhuma questão exemplo encontrada."); }
        } else { console.log("[PracticePage] Nenhum filtro para questão exemplo."); }
        
        const currentSubjectData = subjects.find(s => s.subject_id === selectedSubjectId);
        const selectedSubjectName = currentSubjectData?.subject_name;
        const selectedAreaName = currentSubjectData?.area_name;
        const selectedTopicName = topics.find(t => t.id === selectedTopicId)?.name;

        const organName = exampleQuestionForAI?.organ_name || currentFocusDetails?.organ_name || "Concurso Público";
        const positionName = currentFocusDetails?.position_name || "Cargo Específico";
        const bancaNameForPayload = currentFocusDetails.banca_name; 
        const educationLevelForPayload = currentFocusDetails.education_level_name || "Superior";
        const questionStyleForPayload = exampleQuestionForAI?.question_style_name || "ME5";
        const difficultyLevelForPayload = exampleQuestionForAI?.difficulty_level ? difficultyMapForAI[exampleQuestionForAI.difficulty_level] : "Moderado";
        
        const chatInputPayload: any = {
            exam_type: organName, orgao: organName, cargo: positionName, estilo: questionStyleForPayload,
            nivel_escolaridade: educationLevelForPayload, banca: bancaNameForPayload, grau_dificuldade: difficultyLevelForPayload,
            area: selectedAreaName ? { name: selectedAreaName } : undefined,
            subject: selectedSubjectName ? { name: selectedSubjectName } : undefined,
            topic: selectedTopicName ? { name: selectedTopicName } : undefined,
            example_question: exampleQuestionForAI ? { 
                statement: exampleQuestionForAI.statement, item_text: exampleQuestionForAI.item_text, 
                item_a: exampleQuestionForAI.item_a, item_b: exampleQuestionForAI.item_b,
                item_c: exampleQuestionForAI.item_c, item_d: exampleQuestionForAI.item_d,
                item_e: exampleQuestionForAI.item_e, correct_option: exampleQuestionForAI.correct_option,
                reference_text: exampleQuestionForAI.reference_text,
                question_style_name: exampleQuestionForAI.question_style_name,
            } : undefined,
        };
        Object.keys(chatInputPayload).forEach(key => chatInputPayload[key] === undefined && delete chatInputPayload[key]);

        const requestBody = [{ threadId: currentQuestion?.ai_thread_id || null, chatInput: JSON.stringify(chatInputPayload) }];
        console.log("[PracticePage] Enviando para N8N:", JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://n8n.aprova-ai.com/webhook/21e7767b-dab2-4a1b-9b66-ad30a2608872', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody)
        });

        if (!response.ok) { /* ... */ throw new Error(`Erro N8N ${response.status}`); }
        
        const aiFullResponse = await response.json(); // N8N retorna { output: "stringJSON", threadId: "..." }
        console.log("[PracticePage] N8N response.json() raw:", aiFullResponse);

        if (!aiFullResponse || typeof aiFullResponse.output !== 'string' || typeof aiFullResponse.threadId !== 'string' || 
            aiFullResponse.output.trim() === '' || aiFullResponse.threadId.trim() === '') { 
            console.error("[PracticePage] Resposta N8N formato inesperado (nível 1):", aiFullResponse);
            throw new Error("Resposta da IA (N8N) com 'output' ou 'threadId' ausente/inválido.");
        }
        
        const parsedOutput = JSON.parse(aiFullResponse.output);
        if (!parsedOutput || !parsedOutput.format1) {
            console.error("[PracticePage] 'output' parseado não contém 'format1'. Valor:", parsedOutput);
            throw new Error("Conteúdo 'output.format1' da resposta do N8N ausente ou inválido.");
        }
        const aiQuestionDataFromN8N = parsedOutput.format1 as N8NQuestionOutput; 
        const threadId = aiFullResponse.threadId;
                
        console.log("[PracticePage] Dados IA processados:", aiQuestionDataFromN8N, "Thread:", threadId);
                        
        const newAiQuestion: PracticeQuestion = {
            question_id: `ai-${threadId}`, statement: aiQuestionDataFromN8N.statement,
            item_a: aiQuestionDataFromN8N.A || null, item_b: aiQuestionDataFromN8N.B || null,
            item_c: aiQuestionDataFromN8N.C || null, item_d: aiQuestionDataFromN8N.D || null,
            item_e: aiQuestionDataFromN8N.E || null,
            item_text: aiQuestionDataFromN8N.questionstyle === 'CE' ? (aiQuestionDataFromN8N.A || aiQuestionDataFromN8N.statement || "Item CE") : null, 
            correct_option: aiQuestionDataFromN8N.correct_answer,
            question_style_name: aiQuestionDataFromN8N.questionstyle || 'ME5', 
            organ_name: aiQuestionDataFromN8N.organization || chatInputPayload.orgao,
            position_name: aiQuestionDataFromN8N.position || chatInputPayload.cargo,
            banca_name: aiQuestionDataFromN8N.examboard || `IA (${chatInputPayload.banca || 'Genérica'})`,
            source_year: new Date().getFullYear(),
            difficulty_level: aiQuestionDataFromN8N.difficultylevel ? difficultyLevelMapReverse[aiQuestionDataFromN8N.difficultylevel] : 3,
            reference_text: aiQuestionDataFromN8N.referencetext || null,
            reference_image_url: null, created_by_ai: true, ai_thread_id: threadId,
        };
        setCurrentQuestion(newAiQuestion); setStartTime(Date.now());
      
      let questionStyleIdToSave: string | null = null;
      if (newAiQuestion.question_style_name) {
        const { data: styleData } = await supabase.from('exam_styles').select('id').eq('name', newAiQuestion.question_style_name).single();
        questionStyleIdToSave = styleData?.id || null;
      }

      const questionToInsert = {
        statement: newAiQuestion.statement, item_text: newAiQuestion.item_text,
        item_a: newAiQuestion.item_a, item_b: newAiQuestion.item_b, item_c: newAiQuestion.item_c, item_d: newAiQuestion.item_d, item_e: newAiQuestion.item_e,
        correct_option: newAiQuestion.correct_option,
        exam_subject_id: selectedSubjectId, exam_topic_id: selectedTopicId,     
        exam_position_id: currentActiveExamPositionId, question_style_id: questionStyleIdToSave,
        exam_institution_id: currentFocusDetails?.organ_id || null,
        exam_banca_id: currentFocusDetails?.banca_id || null,      
        education_level_id: currentFocusDetails?.education_level_id || null,
        source_year: newAiQuestion.source_year, difficulty_level: newAiQuestion.difficulty_level,
        created_by_ai: true, ai_thread_id: newAiQuestion.ai_thread_id,
        ai_prompt_details: {payload_sent: chatInputPayload},
        reference_text: newAiQuestion.reference_text,
        reference_image_url: newAiQuestion.reference_image_url,
        origin_user: user.id 
      };
      const { data: insertedData, error: insertError } = await supabase.from('questions').insert(questionToInsert).select().single();
      if (insertError) { console.error("Erro ao salvar questão IA:", insertError); toast.error("Erro ao salvar questão gerada");
      } else { console.log("Questão IA salva:", insertedData); toast.success("Questão inédita gerada e salva!"); }
    } catch (err: any) { console.error("Erro em generateAiQuestion (catch):", err.message); toast.error("Erro ao gerar questão inédita", { description: err.message }); setCurrentQuestion(null);
    } finally { setIsLoadingAiQuestion(false); }
  }, [user, currentActiveExamPositionId, currentFocusDetails, subjects, topics, selectedSubjectId, selectedTopicId, currentQuestion]); // Adicionado currentQuestion na dependência

  const handleRespond = (answer: string) => { 
    if (!currentQuestion) return;
    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    setSelectedAnswer(answer); setShowAnswer(true);
    const isCorrect = answer === currentQuestion.correct_option;
    setFeedback(isCorrect ? `Correto! (${timeSpent}s)` : `Incorreto. Gabarito: ${currentQuestion.correct_option}. (${timeSpent}s)`);
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
              }}
              disabled={isLoadingPageFilters || !subjects || subjects.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder={isLoadingPageFilters ? "Carregando..." : "Filtrar por Disciplina"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Disciplinas</SelectItem>
                {subjects?.map((subject) => (
                  // Usar subject.subject_id e subject.subject_name conforme a interface Subject atualizada
                  <SelectItem key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
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

      {(isLoadingBankQuestion || isLoadingAiQuestion) && ( /* ... (Skeleton/Loading igual) ... */ )}
      {!isLoadingBankQuestion && !isLoadingAiQuestion && currentQuestion && ( /* ... (Card da questão igual) ... */ )}
      {!isLoadingBankQuestion && !isLoadingAiQuestion && !currentQuestion && currentActiveExamPositionId && ( /* ... (Mensagem para iniciar igual) ... */ )}
    </div>
  );
}