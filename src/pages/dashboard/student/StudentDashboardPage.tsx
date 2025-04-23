
import SearchBar from "@/components/student/SearchBar";
import DashboardMetrics from "@/components/student/DashboardMetrics";
import TopicPerformanceChart from "@/components/student/TopicPerformanceChart";
import StudentDashboardHeader from "@/components/student/dashboard/StudentDashboardHeader";
import StudentExamsSection from "@/components/student/dashboard/StudentExamsSection";
import SuggestedExamsSection from "@/components/student/dashboard/SuggestedExamsSection";
import ExamDetailsDialog from "@/components/student/dashboard/ExamDetailsDialog";
import { useState } from "react";
import { useStudentDashboardData } from "./useStudentDashboardData";

export default function StudentDashboardPage() {
  const {
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
  } = useStudentDashboardData();

  const [showRankingDetails, setShowRankingDetails] = useState(false);
  const [showTimeDetails, setShowTimeDetails] = useState(false);

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
