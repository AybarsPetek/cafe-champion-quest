import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContactSettings {
  id: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  working_hours: string | null;
  google_maps_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  additional_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useContactSettings = () => {
  return useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      return data as ContactSettings | null;
    },
  });
};

export const useAllContactSettings = () => {
  return useQuery({
    queryKey: ["contact-settings-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_settings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContactSettings[];
    },
  });
};

export const useCreateContactSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Omit<ContactSettings, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("contact_settings")
        .insert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-settings"] });
      queryClient.invalidateQueries({ queryKey: ["contact-settings-all"] });
      toast.success("İletişim bilgileri eklendi");
    },
    onError: (error) => {
      toast.error("İletişim bilgileri eklenirken hata oluştu");
      console.error(error);
    },
  });
};

export const useUpdateContactSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...settings }: Partial<ContactSettings> & { id: string }) => {
      const { data, error } = await supabase
        .from("contact_settings")
        .update(settings)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-settings"] });
      queryClient.invalidateQueries({ queryKey: ["contact-settings-all"] });
      toast.success("İletişim bilgileri güncellendi");
    },
    onError: (error) => {
      toast.error("İletişim bilgileri güncellenirken hata oluştu");
      console.error(error);
    },
  });
};

export const useDeleteContactSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_settings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-settings"] });
      queryClient.invalidateQueries({ queryKey: ["contact-settings-all"] });
      toast.success("İletişim bilgileri silindi");
    },
    onError: (error) => {
      toast.error("İletişim bilgileri silinirken hata oluştu");
      console.error(error);
    },
  });
};
