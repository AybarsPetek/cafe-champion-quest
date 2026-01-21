-- Create a public view for leaderboard that only exposes necessary data
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id, 
    full_name, 
    avatar_url, 
    level, 
    total_points,
    created_at
  FROM public.profiles;
  -- Excludes: phone, store_name, employment_date, bio

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view all profiles for leaderboard" ON public.profiles;

-- Create a more restrictive policy - users can only see their own full profile
-- Admins can still see all profiles via their existing policy