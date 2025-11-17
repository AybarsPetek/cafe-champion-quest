-- Drop the old foreign key constraint
ALTER TABLE public.course_reviews
DROP CONSTRAINT course_reviews_user_id_fkey;

-- Add new foreign key constraint to profiles table
ALTER TABLE public.course_reviews
ADD CONSTRAINT course_reviews_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;