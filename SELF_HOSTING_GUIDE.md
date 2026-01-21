# TheCompany Coffee Academy - Self Hosting Kılavuzu

Bu kılavuz, projeyi kendi sunucunuzda barındırmak için gereken tüm adımları içerir.

---

## 📋 Ön Gereksinimler

- **Node.js** (v18 veya üzeri) - [İndir](https://nodejs.org/)
- **npm** veya **yarn** paket yöneticisi
- **Git** - [İndir](https://git-scm.com/)
- **Supabase Hesabı** - [Kayıt Ol](https://supabase.com/) (Backend için)

---

## 1️⃣ Kodu İndirme

### Yöntem A: GitHub Üzerinden (Önerilen)

1. Lovable editöründe **GitHub → Connect to GitHub** butonuna tıklayın
2. GitHub hesabınızı yetkilendirin
3. **Create Repository** ile yeni repo oluşturun
4. Bilgisayarınıza klonlayın:

```bash
git clone https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
cd REPO_ADINIZ
```

### Yöntem B: Manuel İndirme

GitHub'a bağlandıktan sonra, GitHub üzerinden ZIP olarak indirebilirsiniz.

---

## 2️⃣ Bağımlılıkları Yükleme

Proje dizininde aşağıdaki komutu çalıştırın:

```bash
npm install
```

---

## 3️⃣ Supabase Projesi Oluşturma

### 3.1 Yeni Proje Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. **New Project** butonuna tıklayın
3. Proje adı, şifre ve bölge seçin
4. **Create new project** ile oluşturun

### 3.2 Veritabanı Şemasını Kurma

Supabase Dashboard'da **SQL Editor**'e gidin ve aşağıdaki SQL'leri sırasıyla çalıştırın:

#### Enum ve Tablolar

```sql
-- App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles tablosu
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  store_name TEXT,
  employment_date DATE,
  total_points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Başlangıç',
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles tablosu
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Courses tablosu
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  instructor TEXT,
  level TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  points INTEGER DEFAULT 100,
  rating NUMERIC(3,2),
  enrolled_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Course videos tablosu
CREATE TABLE public.course_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  duration_minutes INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User course progress tablosu
CREATE TABLE public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_watched_video_id UUID REFERENCES course_videos(id),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- User video progress tablosu
CREATE TABLE public.user_video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
  last_position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Badges tablosu
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User badges tablosu
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Certificates tablosu
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Course reviews tablosu
CREATE TABLE public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Forum categories tablosu
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Forum topics tablosu
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum replies tablosu
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### View'lar

```sql
-- Profiles public view (hassas verileri gizler)
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  full_name,
  avatar_url,
  level,
  total_points,
  created_at
FROM public.profiles;

-- User course progress public view
CREATE VIEW public.user_course_progress_public AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE completed = true) as completed_courses
FROM public.user_course_progress
GROUP BY user_id;

-- User badges public view
CREATE VIEW public.user_badges_public AS
SELECT 
  user_id,
  COUNT(*) as badges_count
FROM public.user_badges
GROUP BY user_id;
```

#### Fonksiyonlar

```sql
-- Kullanıcı onay kontrolü
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(is_approved, false)
  FROM public.profiles
  WHERE id = user_id;
$$;

-- Rol kontrolü
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Sertifika numarası oluşturma
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    SELECT EXISTS(SELECT 1 FROM certificates WHERE certificate_number = new_number) INTO exists_check;
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$;

-- Kurs ilerleme hesaplama
CREATE OR REPLACE FUNCTION public.calculate_course_progress(p_user_id uuid, p_course_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_videos INTEGER;
  completed_videos INTEGER;
  progress INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_videos FROM course_videos WHERE course_id = p_course_id;
  
  SELECT COUNT(*) INTO completed_videos
  FROM user_video_progress uvp
  JOIN course_videos cv ON cv.id = uvp.video_id
  WHERE uvp.user_id = p_user_id AND cv.course_id = p_course_id AND uvp.completed = true;
  
  IF total_videos > 0 THEN
    progress := ROUND((completed_videos::DECIMAL / total_videos::DECIMAL) * 100);
  ELSE
    progress := 0;
  END IF;
  
  RETURN progress;
END;
$$;

-- Yeni kullanıcı için profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$;

-- Varsayılan rol atama
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Kurs değerlendirme güncelleme
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE courses
  SET rating = (SELECT AVG(rating)::numeric(3,2) FROM course_reviews WHERE course_id = COALESCE(NEW.course_id, OLD.course_id))
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Video izleme sonrası kurs ilerleme güncelleme
CREATE OR REPLACE FUNCTION public.update_course_progress_on_video()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_course_id UUID;
  v_progress INTEGER;
BEGIN
  SELECT course_id INTO v_course_id FROM course_videos WHERE id = NEW.video_id;
  v_progress := calculate_course_progress(NEW.user_id, v_course_id);
  
  INSERT INTO user_course_progress (user_id, course_id, progress_percentage, last_watched_video_id, completed)
  VALUES (NEW.user_id, v_course_id, v_progress, NEW.video_id, v_progress = 100)
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET
    progress_percentage = v_progress,
    last_watched_video_id = NEW.video_id,
    completed = v_progress = 100,
    completed_at = CASE WHEN v_progress = 100 THEN NOW() ELSE user_course_progress.completed_at END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Kullanıcı istatistiklerini güncelleme
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  course_points INTEGER;
  new_level TEXT;
  total_points INTEGER;
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    SELECT points INTO course_points FROM courses WHERE id = NEW.course_id;
    
    UPDATE profiles
    SET total_points = COALESCE(profiles.total_points, 0) + course_points
    WHERE id = NEW.user_id
    RETURNING profiles.total_points INTO total_points;
    
    IF total_points >= 1000 THEN new_level := 'Uzman';
    ELSIF total_points >= 500 THEN new_level := 'İleri';
    ELSIF total_points >= 200 THEN new_level := 'Orta';
    ELSE new_level := 'Başlangıç';
    END IF;
    
    UPDATE profiles SET level = new_level WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Rozet kontrolü ve atama
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  badge_record RECORD;
  completed_courses INTEGER;
  user_points INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE ucp.completed = true) as completed,
    COALESCE(p.total_points, 0) as points
  INTO completed_courses, user_points
  FROM profiles p
  LEFT JOIN user_course_progress ucp ON ucp.user_id = p.id
  WHERE p.id = NEW.user_id
  GROUP BY p.id, p.total_points;
  
  FOR badge_record IN SELECT * FROM badges LOOP
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = NEW.user_id AND badge_id = badge_record.id) THEN
      IF (badge_record.criteria_type = 'courses_completed' AND completed_courses >= badge_record.criteria_value)
         OR (badge_record.criteria_type = 'points_earned' AND user_points >= badge_record.criteria_value)
         OR (badge_record.criteria_type = 'specific_course' AND NEW.course_id::TEXT = badge_record.criteria_value::TEXT AND NEW.completed = true)
      THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;
```

#### Trigger'lar

```sql
-- Yeni kullanıcı profili oluşturma
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Varsayılan rol atama
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Kurs değerlendirme güncelleme
CREATE TRIGGER update_course_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_course_rating();

-- Video izleme sonrası kurs ilerleme
CREATE TRIGGER on_video_progress_update
  AFTER INSERT OR UPDATE ON public.user_video_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_course_progress_on_video();

-- Kullanıcı istatistikleri güncelleme
CREATE TRIGGER on_course_progress_update
  AFTER INSERT OR UPDATE ON public.user_course_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- Rozet kontrolü
CREATE TRIGGER check_badges_on_progress
  AFTER INSERT OR UPDATE ON public.user_course_progress
  FOR EACH ROW EXECUTE FUNCTION public.check_and_award_badges();
```

#### RLS Politikaları

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Courses policies
CREATE POLICY "Everyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Course videos policies
CREATE POLICY "Approved users can view videos" ON public.course_videos FOR SELECT USING (is_user_approved(auth.uid()));
CREATE POLICY "Admins can manage videos" ON public.course_videos FOR ALL USING (has_role(auth.uid(), 'admin'));

-- User course progress policies
CREATE POLICY "Users can view own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON public.user_course_progress FOR ALL USING (auth.uid() = user_id);

-- User video progress policies
CREATE POLICY "Users can view own video progress" ON public.user_video_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own video progress" ON public.user_video_progress FOR ALL USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL USING (has_role(auth.uid(), 'admin'));

-- User badges policies
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only service role can insert badges" ON public.user_badges FOR INSERT WITH CHECK (false);

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Course reviews policies
CREATE POLICY "Everyone can view reviews" ON public.course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage own reviews" ON public.course_reviews FOR ALL USING (auth.uid() = user_id);

-- Forum categories policies
CREATE POLICY "Everyone can view categories" ON public.forum_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.forum_categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Forum topics policies
CREATE POLICY "Everyone can view topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Approved users can create topics" ON public.forum_topics FOR INSERT WITH CHECK (is_user_approved(auth.uid()));
CREATE POLICY "Users can update own topics" ON public.forum_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own topics" ON public.forum_topics FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Forum replies policies
CREATE POLICY "Everyone can view replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Approved users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (is_user_approved(auth.uid()));
CREATE POLICY "Users can update own replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON public.forum_replies FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
```

### 3.3 Storage Bucket'ları Oluşturma

Supabase Dashboard'da **Storage** bölümüne gidin ve şu bucket'ları oluşturun:

1. **avatars** - Public: ✅
2. **forum-images** - Public: ✅

### 3.4 Edge Functions

`supabase/functions` klasöründeki fonksiyonları deploy edin:

```bash
# Supabase CLI kurulumu
npm install -g supabase

# Login
supabase login

# Projeye bağlanma
supabase link --project-ref YOUR_PROJECT_REF

# Fonksiyonları deploy etme
supabase functions deploy approve-user
supabase functions deploy send-notification
```

---

## 4️⃣ Environment Variables

Proje kök dizininde `.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_REF
```

Bu değerleri Supabase Dashboard → Settings → API bölümünden alabilirsiniz.

---

## 5️⃣ Edge Functions için Secrets

Supabase Dashboard → Edge Functions → Secrets bölümünden ekleyin:

| Secret Name | Açıklama |
|------------|----------|
| SUPABASE_URL | Proje URL'i |
| SUPABASE_SERVICE_ROLE_KEY | Service role key |
| RESEND_API_KEY | E-posta gönderimi için (opsiyonel) |

---

## 6️⃣ Lokalde Çalıştırma

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` adresinde çalışacaktır.

---

## 7️⃣ Production Build

```bash
npm run build
```

Bu komut `dist` klasörüne production-ready dosyaları oluşturur.

---

## 8️⃣ Hosting Seçenekleri

### Netlify

1. [Netlify](https://netlify.com)'e gidin ve GitHub repo'nuzu bağlayın
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Environment variables ekleyin
4. Deploy!

### Vercel

1. [Vercel](https://vercel.com)'e gidin ve GitHub repo'nuzu import edin
2. Framework Preset: Vite
3. Environment variables ekleyin
4. Deploy!

### Cloudflare Pages

1. [Cloudflare Pages](https://pages.cloudflare.com)'e gidin
2. GitHub repo'nuzu bağlayın
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Environment variables ekleyin
5. Deploy!

### Kendi Sunucunuz (VPS/Dedicated)

```bash
# Build
npm run build

# dist klasörünü sunucunuza kopyalayın
# Nginx veya Apache ile serve edin
```

**Nginx Örnek Konfigürasyon:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/coffee-academy/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip sıkıştırma
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## 9️⃣ İlk Admin Kullanıcısı Oluşturma

1. Normal kayıt ile bir kullanıcı oluşturun
2. Supabase Dashboard → SQL Editor'de çalıştırın:

```sql
-- Kullanıcıyı onaylı yap
UPDATE profiles SET is_approved = true WHERE id = 'USER_ID';

-- Admin rolü ver
INSERT INTO user_roles (user_id, role) VALUES ('USER_ID', 'admin');
```

---

## 🔧 Sorun Giderme

### CORS Hataları
Supabase Dashboard → Settings → API → CORS bölümünden domain'inizi ekleyin.

### Auth Yönlendirme Sorunları
Supabase Dashboard → Authentication → URL Configuration'da site URL'inizi güncelleyin.

### Edge Function Hataları
```bash
supabase functions logs approve-user --project-ref YOUR_PROJECT_REF
```

---

## 📞 Destek

Sorularınız için GitHub Issues kullanabilir veya dokümantasyona başvurabilirsiniz.

---

**Son Güncelleme:** Ocak 2026
