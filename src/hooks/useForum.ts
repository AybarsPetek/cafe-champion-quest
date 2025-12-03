import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useForumCategories = () => {
  return useQuery({
    queryKey: ["forum-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;

      // Get topic counts for each category
      const categoriesWithCounts = await Promise.all(
        data.map(async (category) => {
          const { count } = await supabase
            .from("forum_topics")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id);

          return { ...category, topics_count: count || 0 };
        })
      );

      return categoriesWithCounts;
    },
  });
};

export const useForumTopics = (categoryId?: string) => {
  return useQuery({
    queryKey: ["forum-topics", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("forum_topics")
        .select(`
          *,
          profiles:user_id(id, full_name, avatar_url),
          forum_categories:category_id(name)
        `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get reply counts
      const topicsWithReplies = await Promise.all(
        (data || []).map(async (topic) => {
          const { count } = await supabase
            .from("forum_replies")
            .select("*", { count: "exact", head: true })
            .eq("topic_id", topic.id);

          return { ...topic, replies_count: count || 0 };
        })
      );

      return topicsWithReplies;
    },
  });
};

export const useForumTopic = (topicId: string) => {
  return useQuery({
    queryKey: ["forum-topic", topicId],
    queryFn: async () => {
      // Increment view count (fire and forget)
      supabase
        .from("forum_topics")
        .update({ views_count: supabase.rpc ? 1 : 1 })
        .eq("id", topicId)
        .then(() => {});

      const { data, error } = await supabase
        .from("forum_topics")
        .select(`
          *,
          profiles:user_id(id, full_name, avatar_url),
          forum_categories:category_id(id, name)
        `)
        .eq("id", topicId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!topicId,
  });
};

export const useForumReplies = (topicId: string) => {
  return useQuery({
    queryKey: ["forum-replies", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select(`
          *,
          profiles:user_id(id, full_name, avatar_url)
        `)
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!topicId,
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      categoryId,
      userId,
      title,
      content,
      imageUrl,
    }: {
      categoryId: string;
      userId: string;
      title: string;
      content: string;
      imageUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from("forum_topics")
        .insert({
          category_id: categoryId,
          user_id: userId,
          title,
          content,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
      toast({
        title: "Başarılı",
        description: "Konu başarıyla oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Konu oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      topicId,
      userId,
      content,
      imageUrl,
    }: {
      topicId: string;
      userId: string;
      content: string;
      imageUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          topic_id: topicId,
          user_id: userId,
          content,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
      toast({
        title: "Başarılı",
        description: "Yanıtınız gönderildi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useUploadForumImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("forum-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("forum-images")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Resim yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from("forum_topics")
        .delete()
        .eq("id", topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
      toast({
        title: "Başarılı",
        description: "Konu silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Konu silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ replyId, topicId }: { replyId: string; topicId: string }) => {
      const { error } = await supabase
        .from("forum_replies")
        .delete()
        .eq("id", replyId);

      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", topicId] });
      toast({
        title: "Başarılı",
        description: "Yanıt silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};
