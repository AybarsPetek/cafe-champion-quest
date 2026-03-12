import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InstagramPost {
  id: string;
  post_url: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useInstagramPosts = () => {
  return useQuery({
    queryKey: ["instagram-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as InstagramPost[];
    },
  });
};

export const useAllInstagramPosts = () => {
  return useQuery({
    queryKey: ["instagram-posts-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as InstagramPost[];
    },
  });
};

export const useCreateInstagramPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: { post_url: string; description?: string; order_index?: number }) => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .insert(post)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-posts"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-posts-all"] });
      toast.success("Instagram postu eklendi");
    },
    onError: () => toast.error("Post eklenirken hata oluştu"),
  });
};

export const useUpdateInstagramPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InstagramPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-posts"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-posts-all"] });
      toast.success("Instagram postu güncellendi");
    },
    onError: () => toast.error("Post güncellenirken hata oluştu"),
  });
};

export const useDeleteInstagramPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("instagram_posts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-posts"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-posts-all"] });
      toast.success("Instagram postu silindi");
    },
    onError: () => toast.error("Post silinirken hata oluştu"),
  });
};
