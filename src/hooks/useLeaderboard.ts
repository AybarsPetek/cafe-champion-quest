import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  level: string;
  total_points: number;
  completed_courses: number;
  badges_earned: number;
}

interface ProfilePublic {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  level: string | null;
  total_points: number | null;
  created_at: string | null;
}

interface CourseProgressPublic {
  user_id: string;
  completed_courses: number;
}

interface BadgesPublic {
  user_id: string;
  badges_count: number;
}

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Get all profiles with their stats using the public view (excludes sensitive data)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles_public' as any)
        .select('id, full_name, avatar_url, level, total_points')
        .order('total_points', { ascending: false }) as { data: ProfilePublic[] | null; error: any };

      if (profilesError) throw profilesError;

      // Get completed courses count using aggregated view
      const { data: coursesData, error: coursesError } = await supabase
        .from('user_course_progress_public' as any)
        .select('user_id, completed_courses') as { data: CourseProgressPublic[] | null; error: any };

      if (coursesError) throw coursesError;

      // Get badges count using aggregated view
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges_public' as any)
        .select('user_id, badges_count') as { data: BadgesPublic[] | null; error: any };

      if (badgesError) throw badgesError;

      // Combine data
      const leaderboard: LeaderboardUser[] = profiles?.map((profile) => {
        const courseProgress = coursesData?.find(c => c.user_id === profile.id);
        const completedCourses = courseProgress?.completed_courses || 0;

        const badgeProgress = badgesData?.find(b => b.user_id === profile.id);
        const badgesEarned = badgeProgress?.badges_count || 0;

        return {
          id: profile.id,
          full_name: profile.full_name || 'İsimsiz',
          avatar_url: profile.avatar_url,
          level: profile.level || 'Başlangıç',
          total_points: profile.total_points || 0,
          completed_courses: completedCourses,
          badges_earned: badgesEarned,
        };
      }) || [];

      // Sort by points, then by completed courses, then by badges
      return leaderboard.sort((a, b) => {
        if (b.total_points !== a.total_points) {
          return b.total_points - a.total_points;
        }
        if (b.completed_courses !== a.completed_courses) {
          return b.completed_courses - a.completed_courses;
        }
        return b.badges_earned - a.badges_earned;
      });
    },
  });
};
