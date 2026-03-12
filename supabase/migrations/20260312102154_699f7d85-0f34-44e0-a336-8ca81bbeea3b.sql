
ALTER TABLE public.courses
ADD COLUMN instructor_title text DEFAULT NULL,
ADD COLUMN instructor_bio text DEFAULT NULL;
