import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  store_name: string | null;
  employment_date: string | null;
  bio: string | null;
  phone: string | null;
  level: string | null;
  total_points: number | null;
  created_at: string | null;
}

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data as ProfileData;
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<ProfileData>;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Fotoğraf yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

interface ProfilePublic {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  level: string | null;
  total_points: number | null;
  created_at: string | null;
}

export const useNewMembers = () => {
  return useQuery({
    queryKey: ["new-members"],
    queryFn: async () => {
      // Use the public view to avoid exposing sensitive data
      const { data, error } = await supabase
        .from("profiles_public" as any)
        .select("id, full_name, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(8) as { data: ProfilePublic[] | null; error: any };

      if (error) throw error;
      return data;
    },
  });
};
