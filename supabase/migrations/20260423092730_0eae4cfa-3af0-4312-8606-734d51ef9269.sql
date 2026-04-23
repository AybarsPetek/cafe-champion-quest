-- Notification type enum
CREATE TYPE public.notification_type AS ENUM (
  'course_assigned',
  'deadline_reminder',
  'badge_earned',
  'forum_reply',
  'quiz_result',
  'generic'
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'generic',
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see own
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark as read (limited update)
CREATE POLICY "Users can update read state of their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert (manual broadcast)
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============= Trigger: Course assignment =============
CREATE OR REPLACE FUNCTION public.notify_course_assigned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_title TEXT;
BEGIN
  SELECT title INTO v_course_title FROM courses WHERE id = NEW.course_id;
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.user_id,
    'course_assigned',
    'Yeni eğitim atandı',
    COALESCE(v_course_title, 'Bir eğitim') || ' adlı eğitim sana atandı.' ||
      CASE WHEN NEW.deadline IS NOT NULL
        THEN ' Son tarih: ' || to_char(NEW.deadline, 'DD.MM.YYYY')
        ELSE ''
      END,
    '/course/' || NEW.course_id::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_course_assigned
AFTER INSERT ON public.course_assignments
FOR EACH ROW
EXECUTE FUNCTION public.notify_course_assigned();

-- ============= Trigger: Badge earned =============
CREATE OR REPLACE FUNCTION public.notify_badge_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_name TEXT;
  v_badge_desc TEXT;
BEGIN
  SELECT name, description INTO v_badge_name, v_badge_desc
  FROM badges WHERE id = NEW.badge_id;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.user_id,
    'badge_earned',
    '🏆 Yeni rozet kazandın!',
    'Tebrikler! "' || COALESCE(v_badge_name, 'Yeni rozet') || '" rozetini kazandın.',
    '/dashboard'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_badge_earned
AFTER INSERT ON public.user_badges
FOR EACH ROW
EXECUTE FUNCTION public.notify_badge_earned();

-- ============= Trigger: Forum reply =============
CREATE OR REPLACE FUNCTION public.notify_forum_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topic_owner UUID;
  v_topic_title TEXT;
  v_replier_name TEXT;
BEGIN
  SELECT user_id, title INTO v_topic_owner, v_topic_title
  FROM forum_topics WHERE id = NEW.topic_id;

  -- Don't notify on self-reply
  IF v_topic_owner IS NULL OR v_topic_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, 'Bir kullanıcı') INTO v_replier_name
  FROM profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    v_topic_owner,
    'forum_reply',
    '💬 Konuna yeni cevap',
    v_replier_name || ' "' || COALESCE(v_topic_title, 'konuna') || '" konuna cevap verdi.',
    '/forum/topic/' || NEW.topic_id::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_forum_reply
AFTER INSERT ON public.forum_replies
FOR EACH ROW
EXECUTE FUNCTION public.notify_forum_reply();

-- ============= Trigger: Quiz result =============
CREATE OR REPLACE FUNCTION public.notify_quiz_result()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quiz_title TEXT;
  v_course_id UUID;
BEGIN
  -- Only when attempt is completed (transition from null -> not null)
  IF NEW.completed_at IS NULL OR (OLD.completed_at IS NOT NULL) THEN
    RETURN NEW;
  END IF;

  SELECT q.title, q.course_id INTO v_quiz_title, v_course_id
  FROM quizzes q WHERE q.id = NEW.quiz_id;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.user_id,
    'quiz_result',
    CASE WHEN NEW.passed THEN '✅ Quiz başarılı!' ELSE '📋 Quiz sonucun hazır' END,
    COALESCE(v_quiz_title, 'Quiz') || ' — ' ||
      CASE WHEN NEW.passed
        THEN 'Tebrikler, geçtin!'
        ELSE 'Bu sefer olmadı, tekrar deneyebilirsin.'
      END,
    '/course/' || v_course_id::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_quiz_result
AFTER UPDATE ON public.user_quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.notify_quiz_result();