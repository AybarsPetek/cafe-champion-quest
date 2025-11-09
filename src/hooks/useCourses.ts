import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  duration_minutes: number;
  level: string;
  points: number;
  instructor: string | null;
  enrolled_count: number | null;
  rating: number | null;
  progress?: number;
}

export const useCourses = (userId?: string) => {
  return useQuery({
    queryKey: ["courses", userId],
    queryFn: async () => {
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      // If user is logged in, fetch their progress
      if (userId) {
        const { data: progressData } = await supabase
          .from("user_course_progress")
          .select("course_id, progress_percentage")
          .eq("user_id", userId);

        const progressMap = new Map(
          progressData?.map((p) => [p.course_id, p.progress_percentage]) || []
        );

        return courses.map((course) => ({
          ...course,
          progress: progressMap.get(course.id) || 0,
        }));
      }

      return courses.map((course) => ({ ...course, progress: 0 }));
    },
  });
};
