-- Fix Security Definer views by recreating with SECURITY INVOKER

-- profiles_public
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, full_name, avatar_url, level, total_points, created_at
FROM profiles;

-- user_course_progress_public
DROP VIEW IF EXISTS public.user_course_progress_public;
CREATE VIEW public.user_course_progress_public
WITH (security_invoker = on) AS
SELECT user_id, count(*) FILTER (WHERE completed = true) AS completed_courses
FROM user_course_progress
GROUP BY user_id;

-- user_badges_public
DROP VIEW IF EXISTS public.user_badges_public;
CREATE VIEW public.user_badges_public
WITH (security_invoker = on) AS
SELECT user_id, count(*) AS badges_count
FROM user_badges
GROUP BY user_id;

-- Grant access
GRANT SELECT ON public.profiles_public TO anon, authenticated;
GRANT SELECT ON public.user_course_progress_public TO anon, authenticated;
GRANT SELECT ON public.user_badges_public TO anon, authenticated;