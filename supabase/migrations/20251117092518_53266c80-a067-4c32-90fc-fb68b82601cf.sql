-- Add is_approved column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to be approved (so they don't lose access)
UPDATE public.profiles 
SET is_approved = true;

-- Create function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_approved, false)
  FROM public.profiles
  WHERE id = user_id;
$$;