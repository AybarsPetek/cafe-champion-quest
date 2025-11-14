-- Ensure triggers exist to update course progress when a video progress row changes
-- 1) Update course progress after insert or update on user_video_progress
DROP TRIGGER IF EXISTS trg_update_course_progress_on_user_video ON public.user_video_progress;
CREATE TRIGGER trg_update_course_progress_on_user_video
AFTER INSERT OR UPDATE ON public.user_video_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_course_progress_on_video();

-- 2) Keep updated_at fresh on progress tables (nice to have for UI freshness)
DROP TRIGGER IF EXISTS update_user_video_progress_updated_at ON public.user_video_progress;
CREATE TRIGGER update_user_video_progress_updated_at
BEFORE UPDATE ON public.user_video_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_course_progress_updated_at ON public.user_course_progress;
CREATE TRIGGER update_user_course_progress_updated_at
BEFORE UPDATE ON public.user_course_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();