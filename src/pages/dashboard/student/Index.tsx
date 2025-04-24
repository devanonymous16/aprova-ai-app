
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StudentExam, ExamPosition } from '@/types/student';
import { fetchStudentExams, fetchSuggestedExams, fetchOverallProgress } from '@/services/mockStudentData';
import DashboardHeader from '@/components/student/dashboard/DashboardHeader';
import ProgressOverview from '@/components/student/dashboard/ProgressOverview';
import ExamsSection from '@/components/student/dashboard/ExamsSection';
import TopicPerformanceChart from '@/components/student/TopicPerformanceChart';

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribedExams, setSubscribedExams] = useState<StudentExam[]>([]);
  const [suggestedExams, setSuggestedExams] = useState<ExamPosition[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    document.title = 'Forefy | Dashboard do Estudante';
    
    const loadData = async () => {
      setLoading(true);
      try {
        if (user) {
          const exams = await fetchStudentExams(user.id);
          setSubscribedExams(exams);
          
          const suggested = await fetchSuggestedExams();
          setSuggestedExams(suggested);
          
          const progress = await fetchOverallProgress(user.id);
          setOverallProgress(progress);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader userName={profile?.name || 'Estudante'} />
      
      <ProgressOverview 
        overallProgress={overallProgress}
        examCount={subscribedExams.length}
      />
      
      <ExamsSection
        loading={loading}
        subscribedExams={subscribedExams}
        suggestedExams={suggestedExams}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
