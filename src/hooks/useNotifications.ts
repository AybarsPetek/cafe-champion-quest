import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "course_assigned"
    | "deadline_reminder"
    | "badge_earned"
    | "forum_reply"
    | "quiz_result"
    | "generic";
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export const useNotifications = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [] as Notification[];
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!userId,
  });

  // Realtime subscription — refresh on any change
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
