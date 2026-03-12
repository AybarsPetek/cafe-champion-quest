
-- Library categories table
CREATE TABLE public.library_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.library_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage library categories" ON public.library_categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view library categories" ON public.library_categories FOR SELECT TO authenticated USING (true);

-- Library files table
CREATE TABLE public.library_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.library_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_size bigint,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.library_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage library files" ON public.library_files FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view library files" ON public.library_files FOR SELECT TO authenticated USING (true);

-- Storage bucket for library documents
INSERT INTO storage.buckets (id, name, public) VALUES ('library-files', 'library-files', true);

-- Storage policies
CREATE POLICY "Admins can upload library files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete library files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view library files" ON storage.objects FOR SELECT USING (bucket_id = 'library-files');
