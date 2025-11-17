import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles and roles in parallel to avoid requiring a DB relationship between tables
      const [
        { data: profiles, error: profilesError },
        { data: roles, error: rolesError }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('user_roles')
          .select('user_id, role')
      ]);

      if (profilesError) throw profilesError;
      if (rolesError) throw rolesError;

      const roleByUser: Record<string, string> = {};
      roles?.forEach((r: any) => {
        // If multiple roles ever exist, prefer the first one returned
        if (!roleByUser[r.user_id]) roleByUser[r.user_id] = r.role;
      });

      return profiles?.map((profile: any) => ({
        ...profile,
        role: roleByUser[profile.id] || 'user',
      }));
    },
  });
};

export const useAdminCourses = () => {
  return useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, course_videos(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAdminVideos = () => {
  return useQuery({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_videos')
        .select(`
          *,
          courses!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin videos:', error);
        throw error;
      }
      
      console.log('Admin videos fetched:', data);
      return data;
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseData: any) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Başarılı",
        description: "Kurs başarıyla oluşturuldu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kurs oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...courseData }: any) => {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Başarılı",
        description: "Kurs başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kurs güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Başarılı",
        description: "Kurs başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kurs silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (videoData: any) => {
      const { data, error } = await supabase
        .from('course_videos')
        .insert(videoData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      toast({
        title: "Başarılı",
        description: "Video başarıyla eklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Video eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...videoData }: any) => {
      const { data, error } = await supabase
        .from('course_videos')
        .update(videoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      toast({
        title: "Başarılı",
        description: "Video başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Video güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from('course_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      toast({
        title: "Başarılı",
        description: "Video başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Video silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => {
      // First, delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı rolü başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Rol güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useAdminCertificates = () => {
  return useQuery({
    queryKey: ['admin-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select(`
          *,
          profiles!inner(id, full_name),
          courses!inner(id, title),
          certificates(certificate_number, issued_at)
        `)
        .eq('completed', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useIssueCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      courseId,
    }: {
      userId: string;
      courseId: string;
    }) => {
      // Check if certificate already exists
      const { data: existingCert } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existingCert) {
        throw new Error("Bu kullanıcı için bu kursa ait sertifika zaten mevcut.");
      }

      // Generate unique certificate number
      const { data: funcData, error: funcError } = await supabase.rpc(
        "generate_certificate_number"
      );

      if (funcError) throw funcError;
      const certificateNumber = funcData;

      // Insert certificate record
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          user_id: userId,
          course_id: courseId,
          certificate_number: certificateNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      toast({
        title: "Başarılı",
        description: "Sertifika başarıyla oluşturuldu.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Sertifika oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const usePendingUsers = () => {
  return useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla onaylandı.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kullanıcı onaylanırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useRejectUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla reddedildi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kullanıcı reddedilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};
