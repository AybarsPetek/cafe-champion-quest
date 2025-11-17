import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
  };
}

const reviewSchema = z.object({
  rating: z.number().int().min(1, "En az 1 yıldız vermelisiniz").max(5, "En fazla 5 yıldız verebilirsiniz"),
  comment: z.string().trim().max(1000, "Yorum en fazla 1000 karakter olabilir").optional(),
});

export const useCourseReviews = (courseId: string) => {
  return useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          *,
          profiles(full_name)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!courseId,
  });
};

export const useUserReview = (courseId: string, userId?: string) => {
  return useQuery({
    queryKey: ['user-review', courseId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!userId,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      courseId,
      userId,
      rating,
      comment,
    }: {
      courseId: string;
      userId: string;
      rating: number;
      comment?: string;
    }) => {
      // Validate input
      const validation = reviewSchema.safeParse({ rating, comment });
      
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      const { data, error } = await supabase
        .from('course_reviews')
        .upsert(
          {
            course_id: courseId,
            user_id: userId,
            rating: validation.data.rating,
            comment: validation.data.comment || null,
          },
          {
            onConflict: 'user_id,course_id',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.courseId, variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      toast({
        title: "Değerlendirme Kaydedildi! ⭐",
        description: "Yorumunuz için teşekkürler.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Değerlendirme kaydedilemedi.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId, courseId }: { reviewId: string; courseId: string }) => {
      const { error } = await supabase
        .from('course_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return { courseId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews', data.courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-review'] });
      queryClient.invalidateQueries({ queryKey: ['course', data.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      toast({
        title: "Değerlendirme Silindi",
        description: "Yorumunuz başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Değerlendirme silinemedi.",
        variant: "destructive",
      });
    },
  });
};
