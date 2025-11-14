-- Fix the ambiguous column reference in check_and_award_badges function
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  badge_record RECORD;
  completed_courses INTEGER;
  user_points INTEGER;
BEGIN
  -- Get user stats with explicit table prefixes to avoid ambiguity
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
$function$;

-- Fix the ambiguous column reference in update_user_stats function
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    -- Update user total points with explicit column reference
    UPDATE profiles
    SET total_points = COALESCE(profiles.total_points, 0) + course_points
    WHERE id = NEW.user_id
    RETURNING profiles.total_points INTO total_points;
    
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
$function$;