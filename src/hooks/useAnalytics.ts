import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  totalCourses: number;
  totalVideos: number;
  totalCertificates: number;
  totalQuizAttempts: number;
  quizPassRate: number;
  avgCourseProgress: number;
  courseStats: {
    id: string;
    title: string;
    enrolled: number;
    completed: number;
    avgProgress: number;
    rating: number | null;
    videoCount: number;
  }[];
  monthlyRegistrations: { month: string; count: number }[];
  levelDistribution: { level: string; count: number }[];
  recentActivity: {
    type: string;
    userName: string;
    detail: string;
    date: string;
  }[];
}

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async (): Promise<AnalyticsData> => {
      // Fetch all data in parallel
      const [
        profilesRes,
        coursesRes,
        videosRes,
        certificatesRes,
        quizAttemptsRes,
        courseProgressRes,
        recentCertsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, is_approved, created_at, level"),
        supabase.from("courses").select("id, title, enrolled_count, rating"),
        supabase.from("course_videos").select("id, course_id"),
        supabase.from("certificates").select("id"),
        supabase.from("user_quiz_attempts").select("id, passed, completed_at"),
        supabase.from("user_course_progress").select("course_id, progress_percentage, completed, user_id"),
        supabase.from("certificates").select("id, course_id, user_id, issued_at, courses(title)").order("issued_at", { ascending: false }).limit(10),
      ]);

      const profiles = profilesRes.data || [];
      const courses = coursesRes.data || [];
      const videos = videosRes.data || [];
      const certificates = certificatesRes.data || [];
      const quizAttempts = quizAttemptsRes.data || [];
      const courseProgress = courseProgressRes.data || [];

      // Basic counts
      const totalUsers = profiles.length;
      const approvedUsers = profiles.filter(p => p.is_approved).length;
      const pendingUsers = profiles.filter(p => !p.is_approved).length;
      const totalCourses = courses.length;
      const totalVideos = videos.length;
      const totalCertificates = certificates.length;

      // Quiz stats
      const completedAttempts = quizAttempts.filter(a => a.completed_at);
      const totalQuizAttempts = completedAttempts.length;
      const passedAttempts = completedAttempts.filter(a => a.passed).length;
      const quizPassRate = totalQuizAttempts > 0 ? Math.round((passedAttempts / totalQuizAttempts) * 100) : 0;

      // Avg course progress
      const progressValues = courseProgress.map(p => p.progress_percentage || 0);
      const avgCourseProgress = progressValues.length > 0
        ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
        : 0;

      // Per-course stats
      const videoCountMap = new Map<string, number>();
      videos.forEach(v => videoCountMap.set(v.course_id, (videoCountMap.get(v.course_id) || 0) + 1));

      const courseStats = courses.map(c => {
        const cp = courseProgress.filter(p => p.course_id === c.id);
        const completed = cp.filter(p => p.completed).length;
        const avg = cp.length > 0
          ? Math.round(cp.reduce((a, p) => a + (p.progress_percentage || 0), 0) / cp.length)
          : 0;
        return {
          id: c.id,
          title: c.title,
          enrolled: c.enrolled_count || cp.length,
          completed,
          avgProgress: avg,
          rating: c.rating,
          videoCount: videoCountMap.get(c.id) || 0,
        };
      }).sort((a, b) => b.enrolled - a.enrolled);

      // Monthly registrations (last 6 months)
      const monthlyRegistrations: { month: string; count: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = d.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
        const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const count = profiles.filter(p => {
          const created = new Date(p.created_at || "");
          return created >= d && created < nextMonth;
        }).length;
        monthlyRegistrations.push({ month: monthStr, count });
      }

      // Level distribution
      const levelMap = new Map<string, number>();
      profiles.filter(p => p.is_approved).forEach(p => {
        const level = p.level || "Başlangıç";
        levelMap.set(level, (levelMap.get(level) || 0) + 1);
      });
      const levelDistribution = Array.from(levelMap.entries())
        .map(([level, count]) => ({ level, count }))
        .sort((a, b) => b.count - a.count);

      // Recent activity
      const recentActivity: AnalyticsData["recentActivity"] = [];
      const recentCerts = recentCertsRes.data || [];
      recentCerts.forEach((cert: any) => {
        recentActivity.push({
          type: "certificate",
          userName: cert.user_id?.slice(0, 8) || "",
          detail: cert.courses?.title || "Kurs",
          date: cert.issued_at,
        });
      });

      return {
        totalUsers,
        approvedUsers,
        pendingUsers,
        totalCourses,
        totalVideos,
        totalCertificates,
        totalQuizAttempts,
        quizPassRate,
        avgCourseProgress,
        courseStats,
        monthlyRegistrations,
        levelDistribution,
        recentActivity,
      };
    },
    staleTime: 60000,
  });
};
