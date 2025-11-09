-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  duration_minutes INTEGER NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Başlangıç', 'Orta', 'İleri')),
  points INTEGER NOT NULL DEFAULT 0,
  instructor TEXT,
  enrolled_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create course_videos table
CREATE TABLE public.course_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_course_progress table
CREATE TABLE public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_watched_video_id UUID REFERENCES public.course_videos(id),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create user_video_progress table
CREATE TABLE public.user_video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.course_videos(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  last_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'award',
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('courses_completed', 'points_earned', 'consecutive_days', 'specific_course')),
  criteria_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public read)
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  USING (true);

-- RLS Policies for course_videos (public read)
CREATE POLICY "Anyone can view course videos"
  ON public.course_videos FOR SELECT
  USING (true);

-- RLS Policies for user_course_progress
CREATE POLICY "Users can view their own course progress"
  ON public.user_course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course progress"
  ON public.user_course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course progress"
  ON public.user_course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_video_progress
CREATE POLICY "Users can view their own video progress"
  ON public.user_video_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video progress"
  ON public.user_video_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress"
  ON public.user_video_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION public.calculate_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_videos INTEGER;
  completed_videos INTEGER;
  progress INTEGER;
BEGIN
  -- Count total videos in course
  SELECT COUNT(*) INTO total_videos
  FROM course_videos
  WHERE course_id = p_course_id;
  
  -- Count completed videos
  SELECT COUNT(*) INTO completed_videos
  FROM user_video_progress uvp
  JOIN course_videos cv ON cv.id = uvp.video_id
  WHERE uvp.user_id = p_user_id
    AND cv.course_id = p_course_id
    AND uvp.completed = true;
  
  -- Calculate percentage
  IF total_videos > 0 THEN
    progress := ROUND((completed_videos::DECIMAL / total_videos::DECIMAL) * 100);
  ELSE
    progress := 0;
  END IF;
  
  RETURN progress;
END;
$$;

-- Function to update user points and level
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_points INTEGER;
  new_level TEXT;
  total_points INTEGER;
BEGIN
  -- If course just completed
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Get course points
    SELECT points INTO course_points
    FROM courses
    WHERE id = NEW.course_id;
    
    -- Update user total points
    UPDATE profiles
    SET total_points = COALESCE(total_points, 0) + course_points
    WHERE id = NEW.user_id
    RETURNING total_points INTO total_points;
    
    -- Determine new level based on points
    IF total_points >= 1000 THEN
      new_level := 'Uzman';
    ELSIF total_points >= 500 THEN
      new_level := 'İleri';
    ELSIF total_points >= 200 THEN
      new_level := 'Orta';
    ELSE
      new_level := 'Başlangıç';
    END IF;
    
    -- Update user level
    UPDATE profiles
    SET level = new_level
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  badge_record RECORD;
  completed_courses INTEGER;
  user_points INTEGER;
BEGIN
  -- Get user stats
  SELECT 
    COUNT(*) FILTER (WHERE ucp.completed = true) as completed,
    COALESCE(p.total_points, 0) as points
  INTO completed_courses, user_points
  FROM profiles p
  LEFT JOIN user_course_progress ucp ON ucp.user_id = p.id
  WHERE p.id = NEW.user_id
  GROUP BY p.id, p.total_points;
  
  -- Check each badge criteria
  FOR badge_record IN 
    SELECT * FROM badges
  LOOP
    -- Check if user doesn't already have this badge
    IF NOT EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = NEW.user_id AND badge_id = badge_record.id
    ) THEN
      -- Check criteria
      IF (badge_record.criteria_type = 'courses_completed' AND completed_courses >= badge_record.criteria_value)
         OR (badge_record.criteria_type = 'points_earned' AND user_points >= badge_record.criteria_value)
         OR (badge_record.criteria_type = 'specific_course' AND NEW.course_id::TEXT = badge_record.criteria_value::TEXT AND NEW.completed = true)
      THEN
        -- Award badge
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (NEW.user_id, badge_record.id);
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to update course progress when video is completed
CREATE OR REPLACE FUNCTION public.update_course_progress_on_video()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_id UUID;
  v_progress INTEGER;
BEGIN
  -- Get course_id from video
  SELECT course_id INTO v_course_id
  FROM course_videos
  WHERE id = NEW.video_id;
  
  -- Calculate new progress
  v_progress := calculate_course_progress(NEW.user_id, v_course_id);
  
  -- Update or insert course progress
  INSERT INTO user_course_progress (user_id, course_id, progress_percentage, last_watched_video_id, completed)
  VALUES (NEW.user_id, v_course_id, v_progress, NEW.video_id, v_progress = 100)
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET
    progress_percentage = v_progress,
    last_watched_video_id = NEW.video_id,
    completed = v_progress = 100,
    completed_at = CASE WHEN v_progress = 100 THEN NOW() ELSE user_course_progress.completed_at END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_video_progress_update
  AFTER INSERT OR UPDATE ON user_video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_course_progress_on_video();

CREATE TRIGGER on_course_completion
  AFTER INSERT OR UPDATE ON user_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER on_badge_check
  AFTER INSERT OR UPDATE ON user_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

-- Trigger for updated_at timestamps
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
  BEFORE UPDATE ON user_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_video_progress_updated_at
  BEFORE UPDATE ON user_video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_course_videos_course_id ON course_videos(course_id);
CREATE INDEX idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX idx_user_video_progress_user_id ON user_video_progress(user_id);
CREATE INDEX idx_user_video_progress_video_id ON user_video_progress(video_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);