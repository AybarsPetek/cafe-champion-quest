import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Bank Settings Hooks
export const useBankSettings = () => {
  return useQuery({
    queryKey: ['bank-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useActiveBankSettings = () => {
  return useQuery({
    queryKey: ['active-bank-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateBankSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bankData: {
      bank_name: string;
      account_holder: string;
      iban: string;
      additional_info?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('bank_settings')
        .insert(bankData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-settings'] });
      queryClient.invalidateQueries({ queryKey: ['active-bank-settings'] });
      toast({
        title: "Başarılı",
        description: "Banka bilgisi başarıyla eklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Banka bilgisi eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBankSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...bankData }: {
      id: string;
      bank_name?: string;
      account_holder?: string;
      iban?: string;
      additional_info?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('bank_settings')
        .update(bankData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-settings'] });
      queryClient.invalidateQueries({ queryKey: ['active-bank-settings'] });
      toast({
        title: "Başarılı",
        description: "Banka bilgisi başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Banka bilgisi güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBankSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-settings'] });
      queryClient.invalidateQueries({ queryKey: ['active-bank-settings'] });
      toast({
        title: "Başarılı",
        description: "Banka bilgisi başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Banka bilgisi silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

// Pricing Plans Hooks
export const usePricingPlans = () => {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useActivePricingPlans = () => {
  return useQuery({
    queryKey: ['active-pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePricingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: {
      name: string;
      description?: string;
      price: number;
      duration_months?: number;
      features?: string[];
      is_popular?: boolean;
      is_active?: boolean;
      order_index?: number;
    }) => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .insert({
          ...planData,
          features: planData.features || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['active-pricing-plans'] });
      toast({
        title: "Başarılı",
        description: "Fiyat planı başarıyla eklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Fiyat planı eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePricingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...planData }: {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      duration_months?: number;
      features?: string[];
      is_popular?: boolean;
      is_active?: boolean;
      order_index?: number;
    }) => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['active-pricing-plans'] });
      toast({
        title: "Başarılı",
        description: "Fiyat planı başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Fiyat planı güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePricingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['active-pricing-plans'] });
      toast({
        title: "Başarılı",
        description: "Fiyat planı başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Fiyat planı silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};
