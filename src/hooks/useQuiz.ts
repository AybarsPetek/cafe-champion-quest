import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types
export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  passing_score: number;
  is_required_for_certificate: boolean;
  is_active: boolean;
  created_at: string;
  courses?: { title: string };
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  points: number;
  order_index: number;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_points: number | null;
  passed: boolean | null;
  time_spent_seconds: number | null;
}

// Admin hooks
export const useAdminQuizzes = () => {
  return useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes' as any)
        .select(`
          *,
          courses!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Quiz[];
    },
  });
};

export const useQuizQuestions = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: async () => {
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions' as any)
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      const questionIds = (questions as any[]).map((q: any) => q.id);
      
      const { data: options, error: optionsError } = await supabase
        .from('quiz_options' as any)
        .select('*')
        .in('question_id', questionIds)
        .order('order_index');

      if (optionsError) throw optionsError;

      // Attach options to questions
      const questionsWithOptions = (questions as any[]).map((q: any) => ({
        ...q,
        options: (options as any[]).filter((o: any) => o.question_id === q.id)
      }));

      return questionsWithOptions as QuizQuestion[];
    },
    enabled: !!quizId,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quizData: Partial<Quiz>) => {
      const { data, error } = await supabase
        .from('quizzes' as any)
        .insert(quizData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      toast({
        title: "Başarılı",
        description: "Quiz başarıyla oluşturuldu.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message.includes('duplicate') 
          ? "Bu kurs için zaten bir quiz mevcut." 
          : "Quiz oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...quizData }: Partial<Quiz> & { id: string }) => {
      const { data, error } = await supabase
        .from('quizzes' as any)
        .update(quizData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      toast({
        title: "Başarılı",
        description: "Quiz başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Quiz güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quizId: string) => {
      const { error } = await supabase
        .from('quizzes' as any)
        .delete()
        .eq('id', quizId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      toast({
        title: "Başarılı",
        description: "Quiz başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Quiz silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ question, options }: { question: Partial<QuizQuestion>; options: Partial<QuizOption>[] }) => {
      // Create question
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions' as any)
        .insert(question as any)
        .select()
        .single();

      if (questionError) throw questionError;

      // Create options
      const optionsWithQuestionId = options.map(opt => ({
        ...opt,
        question_id: (questionData as any).id
      }));

      const { error: optionsError } = await supabase
        .from('quiz_options' as any)
        .insert(optionsWithQuestionId as any);

      if (optionsError) throw optionsError;

      return questionData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', variables.question.quiz_id] });
      toast({
        title: "Başarılı",
        description: "Soru başarıyla eklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Soru eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questionId, quizId }: { questionId: string; quizId: string }) => {
      const { error } = await supabase
        .from('quiz_questions' as any)
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      return { quizId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', data.quizId] });
      toast({
        title: "Başarılı",
        description: "Soru başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Soru silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};

// User quiz hooks
export const useCourseQuiz = (courseId: string) => {
  return useQuery({
    queryKey: ['course-quiz', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes' as any)
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as Quiz | null;
    },
    enabled: !!courseId,
  });
};

export const useUserQuizAttempts = (userId: string, quizId: string) => {
  return useQuery({
    queryKey: ['user-quiz-attempts', userId, quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_quiz_attempts' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as unknown as QuizAttempt[];
    },
    enabled: !!userId && !!quizId,
  });
};

export const useStartQuizAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, quizId }: { userId: string; quizId: string }) => {
      const { data, error } = await supabase
        .from('user_quiz_attempts' as any)
        .insert({
          user_id: userId,
          quiz_id: quizId,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as QuizAttempt;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-quiz-attempts', variables.userId, variables.quizId] });
    },
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers, 
      timeSpent,
      userId,
      quizId 
    }: { 
      attemptId: string; 
      answers: { questionId: string; selectedOptionId: string }[];
      timeSpent: number;
      userId: string;
      quizId: string;
    }) => {
      const { data, error } = await supabase.rpc('submit_quiz' as any, {
        p_attempt_id: attemptId,
        p_user_id: userId,
        p_quiz_id: quizId,
        p_answers: answers,
        p_time_spent: timeSpent,
      });

      if (error) throw error;

      return data as unknown as { score: number; total_points: number; passed: boolean; scorePercentage: number };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-quiz-attempts', variables.userId, variables.quizId] });
      
      if (data.passed) {
        toast({
          title: "Tebrikler! 🎉",
          description: `Sınavı ${data.scorePercentage}% ile başarıyla geçtiniz!`,
        });
      } else {
        toast({
          title: "Sınav Tamamlandı",
          description: `Puanınız: ${data.scorePercentage}%. Geçme puanına ulaşamadınız.`,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error('Quiz submit error:', error);
      toast({
        title: "Hata",
        description: "Quiz gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
};
