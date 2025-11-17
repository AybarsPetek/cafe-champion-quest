-- Create course_reviews table
CREATE TABLE public.course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reviews" 
ON public.course_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own reviews" 
ON public.course_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.course_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.course_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_course_reviews_updated_at
BEFORE UPDATE ON public.course_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update course rating
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE courses
  SET rating = (
    SELECT AVG(rating)::numeric(3,2)
    FROM course_reviews
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
  )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update course rating after review changes
CREATE TRIGGER update_course_rating_on_review_insert
AFTER INSERT ON public.course_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_course_rating();

CREATE TRIGGER update_course_rating_on_review_update
AFTER UPDATE ON public.course_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_course_rating();

CREATE TRIGGER update_course_rating_on_review_delete
AFTER DELETE ON public.course_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_course_rating();

-- Create index for better performance
CREATE INDEX idx_course_reviews_course_id ON public.course_reviews(course_id);
CREATE INDEX idx_course_reviews_user_id ON public.course_reviews(user_id);