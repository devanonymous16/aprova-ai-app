import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOverallProgress, fetchStudentMetrics } from '@/services/mockStudentData';
import { useStudentExams } from '@/hooks/useStudentExams';
import { useRecommendedExams } from '@/hooks/useRecommendedExams';
import DashboardHeader from '@/components/student/dashboard/DashboardHeader';
import ProgressOverview from '@/components/student/dashboard/ProgressOverview';
import ExamsSection from '@/components/student/dashboard/ExamsSection';
import TopicPerformanceChart from '@/components/student/TopicPerformanceChart';

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { exams: subscribedExams, loading: examsLoading } = useStudentExams(user?.id);
  const { data: recommendedExams, isLoading: recommendedExamsLoading } = useRecommendedExams(searchQuery, true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    questionsResolved: 0,
    practiceDays: { current: 0, total: 0 },
    performance: 0,
    ranking: { position: 0, total: 0 },
    practiceTime: { hours: 0, minutes: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Forefy | Dashboard do Estudante';
    
    const loadData = async () => {
      setLoading(true);
      try {
        if (user) {
          const [progress, studentMetrics] = await Promise.all([
            fetchOverallProgress(user.id),
            fetchStudentMetrics(user.id)
          ]);
          
          setOverallProgress(progress);
          setMetrics(studentMetrics);
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
        metrics={metrics}
      />
      
      {subscribedExams.length > 0 && (
        <TopicPerformanceChart 
          studentId={user?.id || "current-user-id"} 
          examId={subscribedExams[0].exam_position_id}
        />
      )}
      
      <ExamsSection
        loading={loading || examsLoading}
        subscribedExams={subscribedExams}
        recommendedExams={recommendedExams}
        recommendedExamsLoading={recommendedExamsLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}
