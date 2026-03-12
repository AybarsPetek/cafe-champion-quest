import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVideoProgress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const markVideoComplete = useMutation({
    mutationFn: async ({
      userId,
      videoId,
    }: {
      userId: string;
      videoId: string;
    }) => {
      const { data, error } = await supabase
        .from("user_video_progress")
        .upsert(
          {
            user_id: userId,
            video_id: videoId,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,video_id",
          }
        )
        .select()
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) console.error('Error marking video complete:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: async (data, variables) => {
      // Check if course is completed
      const { data: courseProgress } = await supabase
        .from("user_course_progress")
        .select("*, courses(title)")
        .eq("user_id", variables.userId)
        .eq("completed", true)
        .single();

      // If course just completed, send email
      if (courseProgress && courseProgress.progress_percentage === 100) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", variables.userId)
            .single();

          const { data: { user } } = await supabase.auth.getUser();

          if (user?.email) {
            await supabase.functions.invoke('send-notification', {
              body: {
                type: 'course_completed',
                email: user.email,
                data: {
                  userName: profile?.full_name || 'Değerli Öğrenci',
                  courseName: courseProgress.courses?.title || 'Kurs',
                },
              },
            });
          }
        } catch (emailError) {
          if (import.meta.env.DEV) console.error('Failed to send course completion email:', emailError);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["course"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", variables.userId] });
      
      toast({
        title: "Video Tamamlandı! 🎉",
        description: "İlerlemeniz kaydedildi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Video ilerlemeniz kaydedilemedi.",
        variant: "destructive",
      });
      if (import.meta.env.DEV) console.error("Error marking video complete:", error);
    },
  });

  return { markVideoComplete };
};
