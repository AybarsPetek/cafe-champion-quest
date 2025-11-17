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

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Get all profiles with their stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, level, total_points')
        .order('total_points', { ascending: false });

      if (profilesError) throw profilesError;

      // Get completed courses count for each user
      const { data: coursesData, error: coursesError } = await supabase
        .from('user_course_progress')
        .select('user_id, completed');

      if (coursesError) throw coursesError;

      // Get badges count for each user
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('user_id');

      if (badgesError) throw badgesError;

      // Combine data
      const leaderboard: LeaderboardUser[] = profiles?.map((profile) => {
        const completedCourses = coursesData?.filter(
          (c) => c.user_id === profile.id && c.completed
        ).length || 0;

        const badgesEarned = badgesData?.filter(
          (b) => b.user_id === profile.id
        ).length || 0;

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
