-- Allow everyone to view profiles for leaderboard
CREATE POLICY "Anyone can view all profiles for leaderboard" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow everyone to view user course progress for leaderboard stats
CREATE POLICY "Anyone can view course progress for leaderboard" 
ON public.user_course_progress 
FOR SELECT 
USING (true);

-- Allow everyone to view user badges for leaderboard stats
CREATE POLICY "Anyone can view user badges for leaderboard" 
ON public.user_badges 
FOR SELECT 
USING (true);