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
      console.log('Marking video complete:', { userId, videoId });
      
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
        console.error('Error marking video complete:', error);
        throw error;
      }
      
      console.log('Video marked complete successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Success callback triggered');
      
      // Invalidate all related queries to refresh the UI
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
      console.error("Error marking video complete:", error);
    },
  });

  return { markVideoComplete };
};
