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
  last_watched_video_id?: string | null;
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
          .select("course_id, progress_percentage, last_watched_video_id")
          .eq("user_id", userId);

        const progressMap = new Map(
          progressData?.map((p) => [
            p.course_id,
            { progress: p.progress_percentage, lastVideo: p.last_watched_video_id },
          ]) || []
        );

        return courses.map((course) => {
          const entry = progressMap.get(course.id);
          return {
            ...course,
            progress: entry?.progress || 0,
            last_watched_video_id: entry?.lastVideo || null,
          };
        });
      }

      return courses.map((course) => ({
        ...course,
        progress: 0,
        last_watched_video_id: null,
      }));
    },
  });
};
