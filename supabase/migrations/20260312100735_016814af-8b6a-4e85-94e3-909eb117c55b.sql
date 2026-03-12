
-- Drop stale overly permissive policies
DROP POLICY IF EXISTS "Anyone can view course progress for leaderboard" ON public.user_course_progress;
DROP POLICY IF EXISTS "Anyone can view user badges for leaderboard" ON public.user_badges;

-- Fix quiz attempts: restrict UPDATE so users cannot manipulate score/passed/total_points
DROP POLICY IF EXISTS "Users can update their own attempts" ON public.user_quiz_attempts;

CREATE POLICY "Users can update their own attempts"
  ON public.user_quiz_attempts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND score IS NOT DISTINCT FROM (SELECT score FROM public.user_quiz_attempts uqa WHERE uqa.id = user_quiz_attempts.id)
    AND passed IS NOT DISTINCT FROM (SELECT passed FROM public.user_quiz_attempts uqa WHERE uqa.id = user_quiz_attempts.id)
    AND total_points IS NOT DISTINCT FROM (SELECT total_points FROM public.user_quiz_attempts uqa WHERE uqa.id = user_quiz_attempts.id)
  );
