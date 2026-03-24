
-- Fix 1: Certificates RLS - require course completion
DROP POLICY "Users can insert their own certificates" ON public.certificates;
CREATE POLICY "Users can insert certificates only for completed courses"
  ON public.certificates FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.can_get_certificate(auth.uid(), course_id)
  );

-- Fix 2: Quiz options - create a view without is_correct and restrict base table
DROP POLICY "Anyone can view quiz options" ON public.quiz_options;
CREATE POLICY "Only admins can view quiz options directly"
  ON public.quiz_options FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create a safe view for quiz-taking (no is_correct)
CREATE OR REPLACE VIEW public.quiz_options_safe AS
  SELECT id, question_id, option_text, order_index
  FROM public.quiz_options;

GRANT SELECT ON public.quiz_options_safe TO authenticated;
GRANT SELECT ON public.quiz_options_safe TO anon;
