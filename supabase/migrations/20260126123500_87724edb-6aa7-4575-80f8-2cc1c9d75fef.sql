-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('course-videos', 'course-videos', true, 1073741824) -- 1GB limit
ON CONFLICT (id) DO NOTHING;

-- RLS policies for course-videos bucket
-- Allow public read access (for video playback)
CREATE POLICY "Course videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

-- Allow admins to upload videos
CREATE POLICY "Admins can upload course videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-videos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update videos
CREATE POLICY "Admins can update course videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-videos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete videos
CREATE POLICY "Admins can delete course videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-videos' 
  AND public.has_role(auth.uid(), 'admin')
);