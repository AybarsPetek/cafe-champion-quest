-- Create quizzes table (linked to courses)
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER NOT NULL DEFAULT 30,
  passing_score INTEGER NOT NULL DEFAULT 70,
  is_required_for_certificate BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id) -- One quiz per course
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
  points INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz options table (for multiple choice and true/false)
CREATE TABLE public.quiz_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Create user quiz attempts table
CREATE TABLE public.user_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  total_points INTEGER,
  passed BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER
);

-- Create user quiz answers table
CREATE TABLE public.user_quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.user_quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.quiz_options(id) ON DELETE SET NULL,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_answers ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quizzes" ON public.quizzes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Quiz questions policies
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Quiz options policies
CREATE POLICY "Anyone can view quiz options" ON public.quiz_options
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage quiz options" ON public.quiz_options
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- User quiz attempts policies
CREATE POLICY "Users can view their own attempts" ON public.user_quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" ON public.user_quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" ON public.user_quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.user_quiz_attempts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- User quiz answers policies
CREATE POLICY "Users can view their own answers" ON public.user_quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_quiz_attempts 
      WHERE id = user_quiz_answers.attempt_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own answers" ON public.user_quiz_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_quiz_attempts 
      WHERE id = user_quiz_answers.attempt_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all answers" ON public.user_quiz_answers
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check if user can get certificate (passed quiz if required)
CREATE OR REPLACE FUNCTION public.can_get_certificate(p_user_id UUID, p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  quiz_exists BOOLEAN;
  quiz_passed BOOLEAN;
  course_completed BOOLEAN;
BEGIN
  -- Check if course is completed
  SELECT completed INTO course_completed
  FROM user_course_progress
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  IF NOT COALESCE(course_completed, false) THEN
    RETURN false;
  END IF;
  
  -- Check if quiz exists and is required
  SELECT EXISTS (
    SELECT 1 FROM quizzes 
    WHERE course_id = p_course_id 
    AND is_active = true 
    AND is_required_for_certificate = true
  ) INTO quiz_exists;
  
  IF NOT quiz_exists THEN
    RETURN true; -- No required quiz, can get certificate
  END IF;
  
  -- Check if user passed the quiz
  SELECT EXISTS (
    SELECT 1 FROM user_quiz_attempts uqa
    JOIN quizzes q ON q.id = uqa.quiz_id
    WHERE uqa.user_id = p_user_id 
    AND q.course_id = p_course_id 
    AND uqa.passed = true
  ) INTO quiz_passed;
  
  RETURN COALESCE(quiz_passed, false);
END;
$$;

-- Add updated_at trigger for quizzes
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();