import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useTrainingAssignments = () => {
  return useQuery({
    queryKey: ['training-assignments'],
    queryFn: async () => {
      // Fetch assignments
      const { data: assignments, error: assignError } = await supabase
        .from('course_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (assignError) throw assignError;

      // Fetch profiles, courses, progress, quiz attempts, certificates in parallel
      const userIds = [...new Set(assignments?.map(a => a.user_id) || [])];
      const courseIds = [...new Set(assignments?.map(a => a.course_id) || [])];

      const [
        { data: profiles },
        { data: courses },
        { data: progress },
        { data: quizAttempts },
        { data: certificates },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds.length ? userIds : ['']),
        supabase.from('courses').select('id, title, is_mandatory').in('id', courseIds.length ? courseIds : ['']),
        supabase.from('user_course_progress').select('*'),
        supabase.from('user_quiz_attempts').select('*').eq('passed', true),
        supabase.from('certificates').select('*'),
      ]);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const courseMap = new Map(courses?.map(c => [c.id, c]) || []);
      const progressMap = new Map(
        progress?.map(p => [`${p.user_id}-${p.course_id}`, p]) || []
      );
      const quizMap = new Map<string, boolean>();
      quizAttempts?.forEach(a => {
        quizMap.set(`${a.user_id}-${a.quiz_id}`, true);
      });
      const certMap = new Map<string, any>();
      certificates?.forEach(c => {
        certMap.set(`${c.user_id}-${c.course_id}`, c);
      });

      return assignments?.map(assignment => {
        const key = `${assignment.user_id}-${assignment.course_id}`;
        const prog = progressMap.get(key);
        return {
          ...assignment,
          profile: profileMap.get(assignment.user_id),
          course: courseMap.get(assignment.course_id),
          progress: prog,
          hasCertificate: certMap.has(key),
          progressPercentage: prog?.progress_percentage || 0,
          lastActivity: prog?.updated_at || assignment.assigned_at,
        };
      });
    },
  });
};

export const useMandatoryCourses = () => {
  return useQuery({
    queryKey: ['mandatory-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, is_mandatory')
        .order('title');
      if (error) throw error;
      return data;
    },
  });
};

export const useToggleMandatory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, isMandatory }: { courseId: string; isMandatory: boolean }) => {
      const { error } = await supabase
        .from('courses')
        .update({ is_mandatory: isMandatory })
        .eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mandatory-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({ title: "Başarılı", description: "Zorunlu eğitim durumu güncellendi." });
    },
    onError: () => {
      toast({ title: "Hata", description: "Güncelleme sırasında bir hata oluştu.", variant: "destructive" });
    },
  });
};

export const useAssignCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, courseId, deadline }: { userId: string; courseId: string; deadline?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('course_assignments')
        .insert({
          user_id: userId,
          course_id: courseId,
          assigned_by: user?.id,
          deadline: deadline || null,
        });
      if (error) throw error;

      // Also enroll user in course progress if not already
      await supabase
        .from('user_course_progress')
        .upsert({ user_id: userId, course_id: courseId }, { onConflict: 'user_id,course_id' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-assignments'] });
      toast({ title: "Başarılı", description: "Eğitim başarıyla atandı." });
    },
    onError: (error: any) => {
      const msg = error?.message?.includes('duplicate') 
        ? "Bu eğitim zaten bu kullanıcıya atanmış." 
        : "Eğitim atanırken bir hata oluştu.";
      toast({ title: "Hata", description: msg, variant: "destructive" });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('course_assignments')
        .delete()
        .eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-assignments'] });
      toast({ title: "Başarılı", description: "Atama kaldırıldı." });
    },
    onError: () => {
      toast({ title: "Hata", description: "Atama kaldırılırken bir hata oluştu.", variant: "destructive" });
    },
  });
};

export const useSendReminder = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, userId, courseTitle, userEmail, userName }: {
      assignmentId: string;
      userId: string;
      courseTitle: string;
      userEmail?: string;
      userName?: string;
    }) => {
      // Get user email from auth if not provided
      let email = userEmail;
      if (!email) {
        // We can't get other users' emails from client, so use edge function
        const { error } = await supabase.functions.invoke('send-notification', {
          body: {
            type: 'training_reminder',
            userId,
            data: { courseName: courseTitle, userName: userName || 'Değerli Personel' },
          },
        });
        if (error) throw error;
      }

      // Update reminder_sent_at
      await supabase
        .from('course_assignments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', assignmentId);
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Hatırlatma e-postası gönderildi." });
    },
    onError: () => {
      toast({ title: "Hata", description: "E-posta gönderilemedi.", variant: "destructive" });
    },
  });
};
