// ARQUIVO COMPLETO E FINAL: src/pages/student/PracticePage.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentFocus } from '@/contexts/StudentFocusContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertTriangle, BookOpen, GraduationCap, Calendar, ShieldCheck, Building, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PracticeQuestion { question_id: string; organ_name: string | null; position_name: string | null; source_year: number | null; banca_name: string | null; difficulty_level: number | null; reference_text: string | null; statement: string; reference_image_url: string | null; item_text: string | null; item_a: string | null; item_b: string | null; item_c: string | null; item_d: string | null; item_e: string | null; question_style_name: string; correct_option: string; explanation_text?: string | null; explanation_a?: string | null; explanation_b?: string | null; explanation_c?: string | null; explanation_d?: string | null; explanation_e?: string | null; }
interface Subject { subject_id: string; subject_name: string; }
interface Topic { topic_id: string; topic_name: string; }
const difficultyMapRender: { [key: number]: string } = { 1: "Elementar", 2: "Fácil", 3: "Moderado", 4: "Difícil", 5: "Desafiador" };

export default function PracticePage() {
  const { user } = useAuth();
  const { currentActiveExamPositionId, linkedPositions, isLoadingFocus } = useStudentFocus();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const currentFocusDetails = linkedPositions?.find(p => p.exam_position_id === currentActiveExamPositionId);

  const resetPracticeState = useCallback(() => { setCurrentQuestion(null); setShowAnswer(false); setSelectedAnswer(null); }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!currentFocusDetails?.organ_id || !currentFocusDetails?.exam_position_id) {
        setSubjects([]);
        setSelectedSubjectId(null);
        return;
      }
      setIsLoadingFilters(true);
      try {
        const { data, error } = await supabase.rpc('get_subjects_for_position', {
          p_institution_id: currentFocusDetails.organ_id,
          p_position_id: currentFocusDetails.exam_position_id
        });
        if (error) throw error;
        setSubjects(data || []);
      } catch (err: any) { toast.error("Erro ao carregar disciplinas.", { description: err.message });
      } finally { setIsLoadingFilters(false); }
    };
    resetPracticeState();
    fetchSubjects();
  }, [currentFocusDetails, resetPracticeState]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSubjectId || !currentFocusDetails?.organ_id || !currentFocusDetails?.exam_position_id) {
        setTopics([]);
        setSelectedTopicId(null);
        return;
      }
      setIsLoadingFilters(true);
      try {
        const { data, error } = await supabase.rpc('get_topics_for_subject', {
          p_institution_id: currentFocusDetails.organ_id,
          p_position_id: currentFocusDetails.exam_position_id,
          p_subject_id: selectedSubjectId
        });
        if (error) throw error;
        setTopics(data || []);
      } catch (err: any) { toast.error("Erro ao carregar tópicos.", { description: err.message });
      } finally { setIsLoadingFilters(false); }
    };
    resetPracticeState();
    fetchTopics();
  }, [selectedSubjectId, currentFocusDetails, resetPracticeState]);

  const fetchBankQuestion = useCallback(async () => {
    if (!currentFocusDetails?.organ_id || !currentFocusDetails?.exam_position_id) return;
    
    // LOGS PARA DEBUG
    console.log('🔍 DEBUG - Parâmetros enviados para busca:');
    console.log('  - organ_id:', currentFocusDetails.organ_id);
    console.log('  - exam_position_id:', currentFocusDetails.exam_position_id);
    console.log('  - selectedSubjectId:', selectedSubjectId);
    console.log('  - selectedTopicId:', selectedTopicId);
    console.log('  - currentFocusDetails:', currentFocusDetails);
    
    setIsLoadingQuestion(true);
    resetPracticeState();
    try {
      const { data, error } = await supabase.rpc('get_random_practice_question', {
        p_institution_id: currentFocusDetails.organ_id,
        p_position_id: currentFocusDetails.exam_position_id,
        p_subject_id: selectedSubjectId,
        p_topic_id: selectedTopicId
      });
      
      // LOGS PARA DEBUG
      console.log('🔍 DEBUG - Resposta do Supabase:');
      console.log('  - error:', error);
      console.log('  - data:', data);
      console.log('  - data.length:', data?.length);
      
      if (error) throw error;
      if (data && data.length > 0) { 
        console.log('✅ DEBUG - Questão encontrada:', data[0]);
        setCurrentQuestion(data[0]); 
        setStartTime(Date.now()); 
      } 
      else { 
        console.log('❌ DEBUG - Nenhuma questão encontrada');
        toast.info("Nenhuma questão (não-IA) encontrada para estes filtros.", { description: "Tente filtros mais amplos ou gere uma questão com IA.", duration: 5000 }); 
      }
    } catch (err: any) { 
      console.log('💥 DEBUG - Erro na busca:', err);
      toast.error("Erro ao carregar questão do banco", { description: err.message });
    } finally { setIsLoadingQuestion(false); }
  }, [currentFocusDetails, selectedSubjectId, selectedTopicId, resetPracticeState]);

  const handleRespond = async (answer: string) => {
    if (!currentQuestion || !user) { toast.error("Não foi possível registrar a resposta."); return; }
    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    const isCorrect = answer === currentQuestion.correct_option;
    setSelectedAnswer(answer);
    setShowAnswer(true);
    try {
      const { error } = await supabase.rpc('register_student_answer', { p_student_id: user.id, p_question_id: currentQuestion.question_id, p_selected_option: answer, p_is_correct: isCorrect, p_time_spent_seconds: timeSpent });
      if (error) throw error;
      toast.success("Sua resposta foi registrada com sucesso!");
    } catch(err: any) { toast.error("Erro ao salvar sua resposta no banco.", { description: err.message }); }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Button variant="outline" onClick={() => navigate('/dashboard/student')} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao Dashboard</Button>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Praticar Questões</h1>
      {isLoadingFocus ? <Skeleton className="h-6 w-3/4 my-1" /> : (
        currentFocusDetails ? (<p className="mb-6 text-md text-muted-foreground">Foco: <span className="font-semibold text-primary">{currentFocusDetails.position_name}</span></p>) : 
        (<Card className="mb-6 bg-amber-50 border-amber-200"><CardHeader className="flex flex-row items-center gap-4"><AlertTriangle className="h-8 w-8 text-amber-500"/><div><h3 className="font-semibold text-amber-800">Nenhum Foco Selecionado</h3><p className="text-sm text-amber-700">Volte ao seu dashboard e selecione um concurso para praticar.</p></div></CardHeader></Card>)
      )}
      {currentActiveExamPositionId && (
        <>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Select value={selectedSubjectId || 'all'} onValueChange={(value) => { setSelectedSubjectId(value === 'all' ? null : value); setSelectedTopicId(null); }} disabled={isLoadingFilters || subjects.length === 0}>
              <SelectTrigger className="w-full sm:w-[320px]"><SelectValue placeholder={isLoadingFilters ? "Carregando..." : (subjects.length === 0 ? "Sem disciplinas para este cargo" : "Filtrar por Disciplina")} /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todas as Disciplinas</SelectItem>{subjects.map((s) => (<SelectItem key={s.subject_id} value={s.subject_id}>{s.subject_name}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={selectedTopicId || 'all'} onValueChange={(value) => setSelectedTopicId(value === 'all' ? null : value)} disabled={isLoadingFilters || !selectedSubjectId || topics.length === 0}>
              <SelectTrigger className="w-full sm:w-[320px]"><SelectValue placeholder={isLoadingFilters && selectedSubjectId ? "Carregando..." : (topics.length === 0 && selectedSubjectId ? "Sem tópicos para esta disciplina" : "Filtrar por Tópico")} /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos os Tópicos</SelectItem>{topics.map((t) => (<SelectItem key={t.topic_id} value={t.topic_id}>{t.topic_name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Button onClick={fetchBankQuestion} disabled={isLoadingQuestion} size="lg"><BookOpen className="mr-2 h-5 w-5" />{isLoadingQuestion ? "Buscando..." : "Buscar no Banco"}</Button>
            <Button disabled={true} size="lg"><Sparkles className="mr-2 h-5 w-5" />Gerar com IA (Próxima Fase)</Button>
          </div>
        </>
      )}
      {isLoadingQuestion && <div className="text-center text-muted-foreground p-10">Buscando uma nova questão para você...</div>}
      {!isLoadingQuestion && currentQuestion && ( <Card className="mt-6"> <CardHeader> <div className="flex flex-wrap items-center gap-2 text-xs"> {currentQuestion.banca_name && <Badge variant="outline"><ShieldCheck className="h-3 w-3 mr-1.5" />{currentQuestion.banca_name}</Badge>} {currentQuestion.organ_name && <Badge variant="outline"><Building className="h-3 w-3 mr-1.5" />{currentQuestion.organ_name}</Badge>} {currentQuestion.position_name && <Badge variant="outline"><GraduationCap className="h-3 w-3 mr-1.5" />{currentQuestion.position_name}</Badge>} {currentQuestion.source_year && <Badge variant="outline"><Calendar className="h-3 w-3 mr-1.5" />{currentQuestion.source_year}</Badge>} {currentQuestion.difficulty_level && <Badge variant="secondary">{difficultyMapRender[currentQuestion.difficulty_level]}</Badge>} </div> </CardHeader> <CardContent> {currentQuestion.reference_text && <div className="mb-4 p-3 bg-slate-50 border rounded-md text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: currentQuestion.reference_text }} />} <div className="mb-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: currentQuestion.statement }} /> <div className="space-y-3"> {(currentQuestion.question_style_name === 'ME4' || currentQuestion.question_style_name === 'ME5' || !currentQuestion.question_style_name) && ['A', 'B', 'C', 'D', 'E'].map(label => { const itemKey = `item_${label.toLowerCase()}` as keyof PracticeQuestion; const itemValue = currentQuestion[itemKey]; if (!itemValue) return null; let variant: "default" | "destructive" | "outline" | "secondary" = "outline"; let Icon = null; if (showAnswer) { const isCorrectOption = label === currentQuestion.correct_option; const isSelectedOption = label === selectedAnswer; if (isSelectedOption && isCorrectOption) { variant = "default"; Icon = CheckCircle; } else if (isSelectedOption && !isCorrectOption) { variant = "destructive"; Icon = XCircle; } else if (isCorrectOption) { variant = "secondary"; Icon = CheckCircle; } } return ( <Button key={label} onClick={() => handleRespond(label)} variant={variant} disabled={showAnswer} className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"> {Icon && <Icon className="h-4 w-4 mr-2 flex-shrink-0" />} <span className="font-semibold mr-2">{label})</span> <div className="prose-sm max-w-none prose-p:my-0" dangerouslySetInnerHTML={{ __html: itemValue }} /> </Button> ); })} </div> {showAnswer && ( <Card className="mt-6 border-t pt-4"> <CardHeader className="p-0 mb-4"><CardTitle>Comentários da Questão</CardTitle></CardHeader> <CardContent className="p-0 space-y-4 text-sm"> {currentQuestion.explanation_text && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: currentQuestion.explanation_text}}/>} {['A', 'B', 'C', 'D', 'E'].map(label => { const explanationKey = `explanation_${label.toLowerCase()}` as keyof PracticeQuestion; const explanationValue = currentQuestion[explanationKey]; if (!explanationValue) return null; const isCorrectOption = label === currentQuestion.correct_option; const isSelectedOption = label === selectedAnswer; return ( <div key={label} className="flex gap-3"> <div className={`mt-1 h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full text-white ${ isCorrectOption ? 'bg-green-500' : 'bg-gray-400' }`}> <span className="text-xs font-bold">{label}</span> </div> <div className={`prose-sm max-w-none ${isSelectedOption && !isCorrectOption ? 'text-red-600' : ''}`} dangerouslySetInnerHTML={{__html: explanationValue}} /> </div> ) })} </CardContent> </Card> )} </CardContent> </Card> )}
      {!isLoadingQuestion && !currentQuestion && currentActiveExamPositionId && ( <p className="mt-6 text-center text-muted-foreground">Selecione os filtros e busque uma questão para começar.</p> )}
    </div>
  );
}