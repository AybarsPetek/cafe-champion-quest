import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  completedCourses: number;
  totalPoints: number;
  badgesCount: number;
  level: string;
  progressToNextLevel: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  earned: boolean;
  earnedAt?: string;
}

export interface InProgressCourse {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  duration_minutes: number;
  level: string;
  points: number;
  progress: number;
}

export interface AssignedCourse {
  id: string;
  course_id: string;
  course_title: string;
  deadline: string | null;
  completed: boolean;
  completed_at: string | null;
  progress: number;
}

export const useUserDashboard = (userId: string) => {
  return useQuery({
    queryKey: ["dashboard", userId],
    queryFn: async () => {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Fetch completed courses count
      const { data: completedCourses, error: completedError } = await supabase
        .from("user_course_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("completed", true);

      if (completedError) throw completedError;

      // Fetch user badges
      const { data: userBadges, error: userBadgesError } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", userId);

      if (userBadgesError) throw userBadgesError;

      // Fetch all badges
      const { data: allBadges, error: allBadgesError } = await supabase
        .from("badges")
        .select("*");

      if (allBadgesError) throw allBadgesError;

      const userBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));
      const badges: Badge[] = allBadges.map((badge) => {
        const userBadge = userBadges.find((ub) => ub.badge_id === badge.id);
        return {
          ...badge,
          earned: userBadgeIds.has(badge.id),
          earnedAt: userBadge?.earned_at,
        };
      });

      // Fetch in-progress courses
      const { data: inProgressData, error: inProgressError } = await supabase
        .from("user_course_progress")
        .select(
          `
          progress_percentage,
          courses (
            id,
            title,
            description,
            image_url,
            duration_minutes,
            level,
            points
          )
        `
        )
        .eq("user_id", userId)
        .eq("completed", false)
        .gt("progress_percentage", 0)
        .limit(4);

      if (inProgressError) throw inProgressError;

      const inProgressCourses: InProgressCourse[] =
        inProgressData
          ?.map((item: any) => ({
            id: item.courses.id,
            title: item.courses.title,
            description: item.courses.description,
            image_url: item.courses.image_url,
            duration_minutes: item.courses.duration_minutes,
            level: item.courses.level,
            points: item.courses.points,
            progress: item.progress_percentage,
          }))
          .filter((course: InProgressCourse) => course.id) || [];

      // Fetch assigned courses
      const { data: assignments, error: assignError } = await supabase
        .from("course_assignments")
        .select("id, course_id, deadline, completed, completed_at")
        .eq("user_id", userId)
        .order("deadline", { ascending: true, nullsFirst: false });

      if (assignError) throw assignError;

      const assignedCourseIds = assignments?.map((a) => a.course_id) || [];
      let assignedCoursesMap = new Map<string, any>();
      if (assignedCourseIds.length > 0) {
        const { data: assignedCoursesData } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", assignedCourseIds);
        assignedCoursesData?.forEach((c) => assignedCoursesMap.set(c.id, c));
      }

      // Get progress for assigned courses
      let assignedProgressMap = new Map<string, number>();
      if (assignedCourseIds.length > 0) {
        const { data: assignedProgress } = await supabase
          .from("user_course_progress")
          .select("course_id, progress_percentage")
          .eq("user_id", userId)
          .in("course_id", assignedCourseIds);
        assignedProgress?.forEach((p) =>
          assignedProgressMap.set(p.course_id, p.progress_percentage || 0)
        );
      }

      const assignedCourses: AssignedCourse[] = (assignments || []).map((a) => ({
        id: a.id,
        course_id: a.course_id,
        course_title: assignedCoursesMap.get(a.course_id)?.title || "Bilinmeyen Eğitim",
        deadline: a.deadline,
        completed: a.completed,
        completed_at: a.completed_at,
        progress: assignedProgressMap.get(a.course_id) || 0,
      }));

      // Calculate progress to next level
      const totalPoints = profile.total_points || 0;
      let nextLevelPoints = 200;
      if (totalPoints >= 1000) {
        nextLevelPoints = 1000;
      } else if (totalPoints >= 500) {
        nextLevelPoints = 1000;
      } else if (totalPoints >= 200) {
        nextLevelPoints = 500;
      }

      const progressToNextLevel = Math.min(
        100,
        Math.round((totalPoints / nextLevelPoints) * 100)
      );

      const stats: DashboardStats = {
        completedCourses: completedCourses?.length || 0,
        totalPoints,
        badgesCount: userBadges?.length || 0,
        level: profile.level || "Başlangıç",
        progressToNextLevel,
      };

      return {
        stats,
        badges,
        inProgressCourses,
        assignedCourses,
      };
    },
    enabled: !!userId,
  });
};
