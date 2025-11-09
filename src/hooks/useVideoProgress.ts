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
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
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
