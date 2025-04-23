
import { useEffect, useState } from "react";
import { fetchStudentExams, fetchSuggestedExams, fetchOverallProgress } from "@/services/mockStudentData";
import { StudentExam, ExamPosition } from "@/types/student";
import { useAuth } from "@/contexts/AuthContext";

export function useStudentDashboardData() {
  const { profile, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribedExams, setSubscribedExams] = useState<StudentExam[]>([]);
  const [suggestedExams, setSuggestedExams] = useState<ExamPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedQuestions, setResolvedQuestions] = useState(210);
  const [correctQuestions, setCorrectQuestions] = useState(157);
  const [daysPracticed, setDaysPracticed] = useState(29);
  const [totalDays, setTotalDays] = useState(45);
  const [timePracticedMinutes, setTimePracticedMinutes] = useState(1415);
  const [ranking, setRanking] = useState({ globalRank: 5, totalStudents: 124 });

  useEffect(() => {
    document.title = "Forefy | Dashboard do Estudante";
    const loadData = async () => {
      setLoading(true);
      try {
        if (user) {
          const exams = await fetchStudentExams(user.id);
          setSubscribedExams(exams);
          const suggested = await fetchSuggestedExams();
          setSuggestedExams(suggested);
          const progress = await fetchOverallProgress(user.id);
          // setOverallProgress(progress); // Uncomment when needed
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const filteredSubscribedExams = subscribedExams.filter(exam =>
    exam.exam_position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.exam_position.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSuggestedExams = suggestedExams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const performance = resolvedQuestions > 0 ? Math.round((correctQuestions / resolvedQuestions) * 100) : 0;

  return {
    profile,
    user,
    searchQuery,
    setSearchQuery,
    subscribedExams,
    suggestedExams,
    loading,
    resolvedQuestions,
    correctQuestions,
    daysPracticed,
    totalDays,
    timePracticedMinutes,
    ranking,
    filteredSubscribedExams,
    filteredSuggestedExams,
    performance,
  };
}
