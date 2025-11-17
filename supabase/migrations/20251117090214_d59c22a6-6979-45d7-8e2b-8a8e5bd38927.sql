-- Allow admins to insert certificates for any user
CREATE POLICY "Admins can insert certificates for any user" 
ON public.certificates 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to view all certificates
CREATE POLICY "Admins can view all certificates" 
ON public.certificates 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role)
);