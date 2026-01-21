-- Fix user_badges insert policy - only allow system/trigger to insert badges
DROP POLICY IF EXISTS "System can insert user badges" ON public.user_badges;

-- Create a more restrictive policy - only service role can insert (via triggers)
-- This policy will effectively deny client-side inserts while allowing trigger-based inserts
CREATE POLICY "Only service role can insert badges"
ON public.user_badges
FOR INSERT
WITH CHECK (false);

-- Create public views for leaderboard data to hide sensitive associations
CREATE VIEW public.user_course_progress_public
WITH (security_invoker=on) AS
  SELECT 
    user_id,
    COUNT(*) FILTER (WHERE completed = true) as completed_courses
  FROM public.user_course_progress
  GROUP BY user_id;

CREATE VIEW public.user_badges_public
WITH (security_invoker=on) AS
  SELECT 
    user_id,
    COUNT(*) as badges_count
  FROM public.user_badges
  GROUP BY user_id;