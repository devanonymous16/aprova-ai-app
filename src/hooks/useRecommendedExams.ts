
import { useQuery } from "@tanstack/react-query";
import { fetchRecommendedExams } from "@/services/mockStudentData";

export function useRecommendedExams() {
  return useQuery({
    queryKey: ['recommendedExams'],
    queryFn: fetchRecommendedExams,
  });
}
