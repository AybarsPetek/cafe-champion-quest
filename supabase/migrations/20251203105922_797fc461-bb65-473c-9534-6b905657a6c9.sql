-- Add new profile fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS employment_date DATE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Forum categories table
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'message-circle',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum categories" 
ON public.forum_categories FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage forum categories" 
ON public.forum_categories FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Forum topics table
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum topics" 
ON public.forum_topics FOR SELECT 
USING (true);

CREATE POLICY "Approved users can create topics" 
ON public.forum_topics FOR INSERT 
WITH CHECK (auth.uid() = user_id AND is_user_approved(auth.uid()));

CREATE POLICY "Users can update their own topics" 
ON public.forum_topics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" 
ON public.forum_topics FOR DELETE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum replies" 
ON public.forum_replies FOR SELECT 
USING (true);

CREATE POLICY "Approved users can create replies" 
ON public.forum_replies FOR INSERT 
WITH CHECK (auth.uid() = user_id AND is_user_approved(auth.uid()));

CREATE POLICY "Users can update their own replies" 
ON public.forum_replies FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
ON public.forum_replies FOR DELETE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Storage bucket for forum images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Forum images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'forum-images');

CREATE POLICY "Approved users can upload forum images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'forum-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own forum images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, icon, order_index) VALUES
('Genel Tartışma', 'Kahve ve barista işi hakkında genel sohbetler', 'coffee', 1),
('Teknik Sorular', 'Espresso makineleri, öğütücüler ve ekipman hakkında sorular', 'settings', 2),
('Tarifler', 'Latte art, özel içecekler ve tarifler', 'chef-hat', 3),
('Kariyer', 'İş fırsatları ve kariyer tavsiyeleri', 'briefcase', 4),
('Tanışma', 'Kendinizi tanıtın ve diğer baristalarla tanışın', 'users', 5);