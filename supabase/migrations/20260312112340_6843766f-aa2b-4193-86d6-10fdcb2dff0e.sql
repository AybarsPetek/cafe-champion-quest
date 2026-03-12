
-- Add UPDATE policy for library files storage (needed for overwrite/resumable uploads)
CREATE POLICY "Admins can update library files" ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'::app_role));
