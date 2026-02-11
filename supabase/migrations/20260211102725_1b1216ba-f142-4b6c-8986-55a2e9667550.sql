
-- Add is_mandatory flag to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_mandatory boolean NOT NULL DEFAULT false;

-- Create course_assignments table for tracking assigned trainings
CREATE TABLE public.course_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  deadline timestamp with time zone,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  reminder_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all assignments"
  ON public.course_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
  ON public.course_assignments FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_course_assignments_updated_at
  BEFORE UPDATE ON public.course_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-assign mandatory courses to a user
CREATE OR REPLACE FUNCTION public.auto_assign_mandatory_courses(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.course_assignments (user_id, course_id)
  SELECT p_user_id, id
  FROM public.courses
  WHERE is_mandatory = true
  ON CONFLICT (user_id, course_id) DO NOTHING;
  
  -- Also enroll user in these courses
  INSERT INTO public.user_course_progress (user_id, course_id)
  SELECT p_user_id, id
  FROM public.courses
  WHERE is_mandatory = true
  ON CONFLICT DO NOTHING;
END;
$$;

-- Trigger: when user is approved, auto-assign mandatory courses
CREATE OR REPLACE FUNCTION public.on_user_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_approved = true AND (OLD.is_approved IS NULL OR OLD.is_approved = false) THEN
    PERFORM public.auto_assign_mandatory_courses(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_assign_on_approval
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_user_approved();

-- Sync completion status: when course progress is updated to completed, update assignment too
CREATE OR REPLACE FUNCTION public.sync_assignment_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    UPDATE public.course_assignments
    SET completed = true, completed_at = now(), updated_at = now()
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sync_assignment_completion
  AFTER UPDATE ON public.user_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_assignment_completion();
