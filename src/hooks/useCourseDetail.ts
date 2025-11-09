import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CourseVideo {
  id: string;
  title: string;
  duration_minutes: number;
  order_index: number;
  video_url: string | null;
  completed?: boolean;
}

export interface CourseDetail {
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
  videos: CourseVideo[];
  progress: number;
  lastWatchedVideoId?: string;
}

export const useCourseDetail = (courseId: string, userId?: string) => {
  return useQuery({
    queryKey: ["course", courseId, userId],
    queryFn: async () => {
      // Fetch course details
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;

      // Fetch course videos
      const { data: videos, error: videosError } = await supabase
        .from("course_videos")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (videosError) throw videosError;

      let progress = 0;
      let lastWatchedVideoId: string | undefined;
      let videoProgressMap = new Map<string, boolean>();

      // If user is logged in, fetch progress
      if (userId) {
        const { data: courseProgress } = await supabase
          .from("user_course_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .maybeSingle();

        progress = courseProgress?.progress_percentage || 0;
        lastWatchedVideoId = courseProgress?.last_watched_video_id || undefined;

        // Fetch video completion status
        const { data: videoProgress } = await supabase
          .from("user_video_progress")
          .select("video_id, completed")
          .eq("user_id", userId)
          .in(
            "video_id",
            videos.map((v) => v.id)
          );

        videoProgressMap = new Map(
          videoProgress?.map((vp) => [vp.video_id, vp.completed]) || []
        );
      }

      const videosWithProgress = videos.map((video) => ({
        ...video,
        completed: videoProgressMap.get(video.id) || false,
      }));

      return {
        ...course,
        videos: videosWithProgress,
        progress,
        lastWatchedVideoId,
      } as CourseDetail;
    },
    enabled: !!courseId,
  });
};
