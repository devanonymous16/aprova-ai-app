
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/student/SearchBar";
import DashboardMetrics from "@/components/student/DashboardMetrics";
import TopicPerformanceChart from "@/components/student/TopicPerformanceChart";
import { fetchStudentExams, fetchSuggestedExams, fetchOverallProgress } from "@/services/mockStudentData";
import { StudentExam, ExamPosition } from "@/types/student";
import StudentDashboardHeader from "@/components/student/dashboard/StudentDashboardHeader";
import StudentExamsSection from "@/components/student/dashboard/StudentExamsSection";
import SuggestedExamsSection from "@/components/student/dashboard/SuggestedExamsSection";
import ExamDetailsDialog from "@/components/student/dashboard/ExamDetailsDialog";

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
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
  const [showRankingDetails, setShowRankingDetails] = useState(false);
  const [showTimeDetails, setShowTimeDetails] = useState(false);

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
          // setOverallProgress(progress); // Mantido para uso futuro
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StudentDashboardHeader studentName={profile?.name} />

      <DashboardMetrics
        resolvedQuestions={resolvedQuestions}
        correctQuestions={correctQuestions}
        daysPracticed={daysPracticed}
        totalDays={totalDays}
        performance={performance}
        ranking={ranking}
        timePracticedMinutes={timePracticedMinutes}
        onRankingClick={() => setShowRankingDetails(true)}
        onTimeClick={() => setShowTimeDetails(true)}
      />

      <ExamDetailsDialog
        open={showRankingDetails}
        onClose={() => setShowRankingDetails(false)}
        type="ranking"
      />
      <ExamDetailsDialog
        open={showTimeDetails}
        onClose={() => setShowTimeDetails(false)}
        type="time"
      />

      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <StudentExamsSection
        exams={subscribedExams}
        filteredExams={filteredSubscribedExams}
        loading={loading}
        searchQuery={searchQuery}
      />

      <SuggestedExamsSection
        exams={suggestedExams}
        filteredExams={filteredSuggestedExams}
        loading={loading}
        searchQuery={searchQuery}
      />

      {subscribedExams.length > 0 && (
        <TopicPerformanceChart
          studentId={user?.id || "current-user-id"}
          examId={subscribedExams[0].exam_position_id}
        />
      )}
    </div>
  );
}
