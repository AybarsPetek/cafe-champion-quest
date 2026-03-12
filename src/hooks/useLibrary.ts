import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface LibraryCategory {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface LibraryFile {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  library_categories?: { name: string };
}

export const useLibraryCategories = () => {
  return useQuery({
    queryKey: ['library-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_categories' as any)
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data as unknown as LibraryCategory[];
    },
  });
};

export const useLibraryFiles = (categoryId?: string) => {
  return useQuery({
    queryKey: ['library-files', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('library_files' as any)
        .select('*, library_categories(name)')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as LibraryFile[];
    },
  });
};

// Admin hooks
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; order_index?: number }) => {
      const { error } = await supabase.from('library_categories' as any).insert(data as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-categories'] });
      toast({ title: "Başarılı", description: "Kategori oluşturuldu." });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kategori oluşturulamadı.", variant: "destructive" });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; order_index?: number }) => {
      const { error } = await supabase.from('library_categories' as any).update(data as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-categories'] });
      toast({ title: "Başarılı", description: "Kategori güncellendi." });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kategori güncellenemedi.", variant: "destructive" });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('library_categories' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-categories'] });
      queryClient.invalidateQueries({ queryKey: ['library-files'] });
      toast({ title: "Başarılı", description: "Kategori silindi." });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kategori silinemedi.", variant: "destructive" });
    },
  });
};

export const useUploadLibraryFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, categoryId, name, description }: { file: File; categoryId: string; name: string; description?: string }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${categoryId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('library-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('library-files')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('library_files' as any).insert({
        category_id: categoryId,
        name,
        description: description || null,
        file_url: publicUrl,
        file_size: file.size,
        file_type: fileExt || file.type,
      } as any);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-files'] });
      toast({ title: "Başarılı", description: "Dosya yüklendi." });
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast({ title: "Hata", description: "Dosya yüklenemedi.", variant: "destructive" });
    },
  });
};

export const useDeleteLibraryFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) => {
      // Extract storage path from URL
      const urlParts = fileUrl.split('/library-files/');
      if (urlParts.length > 1) {
        const storagePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('library-files').remove([storagePath]);
      }

      const { error } = await supabase.from('library_files' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-files'] });
      toast({ title: "Başarılı", description: "Dosya silindi." });
    },
    onError: () => {
      toast({ title: "Hata", description: "Dosya silinemedi.", variant: "destructive" });
    },
  });
};
