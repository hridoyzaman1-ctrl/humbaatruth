-- ============================================================================
-- TRUTHLENS COMPLETE SQL SETUP — RUN THIS ONCE
-- ============================================================================
-- This ONE file contains EVERYTHING. No other SQL files needed.
-- Safe to run multiple times (fully idempotent).
-- 
-- HOW: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================


-- ========================
-- PART 1: EXTENSIONS
-- ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ========================
-- PART 2: CORE TABLES
-- ========================

-- Authors/Users
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    bio TEXT,
    role TEXT DEFAULT 'reporter',
    age INTEGER,
    gender TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL DEFAULT '',
    category_id TEXT REFERENCES categories(id),
    author_id UUID REFERENCES authors(id),
    featured_image TEXT,
    video_url TEXT,
    has_video BOOLEAN DEFAULT FALSE,
    show_on_homepage BOOLEAN DEFAULT TRUE,
    custom_author TEXT,
    tags TEXT[],
    is_breaking BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    views INTEGER DEFAULT 0
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    department TEXT,
    type TEXT DEFAULT 'full-time',
    description TEXT,
    requirements TEXT[],
    deadline TIMESTAMPTZ,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings (single-row)
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_name TEXT DEFAULT 'TruthLens',
    tagline TEXT,
    site_description TEXT,
    contact_email TEXT,
    social_links JSONB DEFAULT '[]',
    hero_settings JSONB DEFAULT '{}',
    sections_settings JSONB DEFAULT '[]',
    menu_settings JSONB DEFAULT '[]',
    contact_info JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES authors(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media (file metadata)
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'image',
    size_bytes BIGINT DEFAULT 0,
    mime_type TEXT,
    uploaded_by UUID REFERENCES authors(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internship Benefits
CREATE TABLE IF NOT EXISTS internship_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icon_name TEXT DEFAULT 'Star',
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internship Departments
CREATE TABLE IF NOT EXISTS internship_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icon_name TEXT DEFAULT 'Briefcase',
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internship FAQs
CREATE TABLE IF NOT EXISTS internship_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internship Applications
CREATE TABLE IF NOT EXISTS internship_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    university TEXT,
    department TEXT,
    portfolio TEXT,
    cover_letter TEXT,
    cv_file_name TEXT,
    cv_url TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);


-- ========================
-- PART 3: ADD MISSING COLUMNS (safe, idempotent)
-- ========================
DO $$
BEGIN
    -- articles columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='articles' AND column_name='views') THEN
        ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='articles' AND column_name='custom_author') THEN
        ALTER TABLE articles ADD COLUMN custom_author TEXT;
    END IF;
    -- authors columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='authors' AND column_name='age') THEN
        ALTER TABLE authors ADD COLUMN age INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='authors' AND column_name='gender') THEN
        ALTER TABLE authors ADD COLUMN gender TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='authors' AND column_name='status') THEN
        ALTER TABLE authors ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    -- site_settings new JSONB columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='editorial_settings') THEN
        ALTER TABLE site_settings ADD COLUMN editorial_settings JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='internship_settings') THEN
        ALTER TABLE site_settings ADD COLUMN internship_settings JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='config') THEN
        ALTER TABLE site_settings ADD COLUMN config JSONB DEFAULT '{}';
    END IF;
END $$;


-- ========================
-- PART 4: ENABLE RLS ON ALL TABLES
-- ========================
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;


-- ========================
-- PART 5: DROP ALL OLD POLICIES (nuclear cleanup)
-- ========================

-- AUTHORS
DROP POLICY IF EXISTS "Allow public read access" ON authors;
DROP POLICY IF EXISTS "Allow authenticated manage" ON authors;
DROP POLICY IF EXISTS "Allow individual update own profile" ON authors;
DROP POLICY IF EXISTS "Allow admins to manage all" ON authors;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON authors;
DROP POLICY IF EXISTS "Users can view their own profile" ON authors;
DROP POLICY IF EXISTS "Admins can view all profiles" ON authors;
DROP POLICY IF EXISTS "Admins can update all profiles" ON authors;
DROP POLICY IF EXISTS "Users can update own profile" ON authors;
DROP POLICY IF EXISTS "Super Admin can update everyone" ON authors;
DROP POLICY IF EXISTS "Super Admin Full Access" ON authors;
DROP POLICY IF EXISTS "Public Read Authors" ON authors;
DROP POLICY IF EXISTS "Update Authors" ON authors;
DROP POLICY IF EXISTS "Admin Full Authors" ON authors;
DROP POLICY IF EXISTS "authors_select_policy" ON authors;
DROP POLICY IF EXISTS "authors_update_policy" ON authors;
DROP POLICY IF EXISTS "authors_admin_policy" ON authors;

-- ARTICLES
DROP POLICY IF EXISTS "Allow public read access" ON articles;
DROP POLICY IF EXISTS "Allow authenticated manage" ON articles;
DROP POLICY IF EXISTS "Public can view articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON articles;
DROP POLICY IF EXISTS "Authors can update own articles" ON articles;
DROP POLICY IF EXISTS "Everyone can view articles" ON articles;
DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Authors can insert their own articles" ON articles;
DROP POLICY IF EXISTS "Authors can update their own articles" ON articles;
DROP POLICY IF EXISTS "Authors can delete their own articles" ON articles;
DROP POLICY IF EXISTS "Admins can do everything" ON articles;
DROP POLICY IF EXISTS "Public Read Articles" ON articles;
DROP POLICY IF EXISTS "Create Articles" ON articles;
DROP POLICY IF EXISTS "Update Articles" ON articles;
DROP POLICY IF EXISTS "Delete Articles" ON articles;
DROP POLICY IF EXISTS "articles_select_policy" ON articles;
DROP POLICY IF EXISTS "articles_insert_policy" ON articles;
DROP POLICY IF EXISTS "articles_update_policy" ON articles;
DROP POLICY IF EXISTS "articles_delete_policy" ON articles;

-- CATEGORIES
DROP POLICY IF EXISTS "Allow public read access" ON categories;
DROP POLICY IF EXISTS "Allow authenticated manage" ON categories;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_manage_policy" ON categories;

-- JOBS
DROP POLICY IF EXISTS "Allow public read access" ON jobs;
DROP POLICY IF EXISTS "Allow authenticated manage" ON jobs;
DROP POLICY IF EXISTS "jobs_select_policy" ON jobs;
DROP POLICY IF EXISTS "jobs_manage_policy" ON jobs;

-- SITE_SETTINGS
DROP POLICY IF EXISTS "Allow public read access" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated manage" ON site_settings;
DROP POLICY IF EXISTS "site_settings_select_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_manage_policy" ON site_settings;

-- ACTIVITY_LOG
DROP POLICY IF EXISTS "Allow authenticated manage" ON activity_log;
DROP POLICY IF EXISTS "activity_log_manage_policy" ON activity_log;

-- MEDIA
DROP POLICY IF EXISTS "Public Read Media" ON media;
DROP POLICY IF EXISTS "Auth Manage Media" ON media;

-- INTERNSHIP
DROP POLICY IF EXISTS "Public Read Benefits" ON internship_benefits;
DROP POLICY IF EXISTS "Auth Manage Benefits" ON internship_benefits;
DROP POLICY IF EXISTS "Public Read Departments" ON internship_departments;
DROP POLICY IF EXISTS "Auth Manage Departments" ON internship_departments;
DROP POLICY IF EXISTS "Public Read FAQs" ON internship_faqs;
DROP POLICY IF EXISTS "Auth Manage FAQs" ON internship_faqs;
DROP POLICY IF EXISTS "Public Insert Applications" ON internship_applications;
DROP POLICY IF EXISTS "Auth Read Applications" ON internship_applications;
DROP POLICY IF EXISTS "Auth Manage Applications" ON internship_applications;


-- ========================
-- PART 6: CREATE CLEAN RLS POLICIES
-- ========================
-- RULE: Never check 'authors' inside an 'authors' policy (prevents recursion).

-- AUTHORS
CREATE POLICY "authors_select_policy" ON authors FOR SELECT USING (true);
CREATE POLICY "authors_update_policy" ON authors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "authors_admin_policy" ON authors FOR ALL USING (auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');

-- CATEGORIES
CREATE POLICY "categories_select_policy" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_manage_policy" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- ARTICLES
CREATE POLICY "articles_select_policy" ON articles FOR SELECT USING (true);
CREATE POLICY "articles_insert_policy" ON articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "articles_update_policy" ON articles FOR UPDATE USING (auth.uid() = author_id OR auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');
CREATE POLICY "articles_delete_policy" ON articles FOR DELETE USING (auth.uid() = author_id OR auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');

-- JOBS
CREATE POLICY "jobs_select_policy" ON jobs FOR SELECT USING (true);
CREATE POLICY "jobs_manage_policy" ON jobs FOR ALL USING (auth.role() = 'authenticated');

-- SITE_SETTINGS
CREATE POLICY "site_settings_select_policy" ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_manage_policy" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ACTIVITY_LOG
CREATE POLICY "activity_log_manage_policy" ON activity_log FOR ALL USING (auth.role() = 'authenticated');

-- MEDIA
CREATE POLICY "Public Read Media" ON media FOR SELECT USING (true);
CREATE POLICY "Auth Manage Media" ON media FOR ALL USING (auth.uid() IS NOT NULL);

-- INTERNSHIP BENEFITS
CREATE POLICY "Public Read Benefits" ON internship_benefits FOR SELECT USING (true);
CREATE POLICY "Auth Manage Benefits" ON internship_benefits FOR ALL USING (auth.uid() IS NOT NULL);

-- INTERNSHIP DEPARTMENTS
CREATE POLICY "Public Read Departments" ON internship_departments FOR SELECT USING (true);
CREATE POLICY "Auth Manage Departments" ON internship_departments FOR ALL USING (auth.uid() IS NOT NULL);

-- INTERNSHIP FAQS
CREATE POLICY "Public Read FAQs" ON internship_faqs FOR SELECT USING (true);
CREATE POLICY "Auth Manage FAQs" ON internship_faqs FOR ALL USING (auth.uid() IS NOT NULL);

-- INTERNSHIP APPLICATIONS
CREATE POLICY "Public Insert Applications" ON internship_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth Read Applications" ON internship_applications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth Manage Applications" ON internship_applications FOR ALL USING (auth.uid() IS NOT NULL);


-- ========================
-- PART 7: SEED DATA
-- ========================

-- Categories
INSERT INTO categories (id, name, description) VALUES
    ('national', 'National', 'News from across the nation'),
    ('international', 'International', 'Global news and events'),
    ('economy', 'Economy', 'Business and financial news'),
    ('entertainment', 'Entertainment', 'Movies, music, and celebrity news'),
    ('sports', 'Sports', 'Sports news and highlights'),
    ('politics', 'Politics', 'Political news and analysis'),
    ('technology', 'Technology', 'Tech news and innovations'),
    ('editorial', 'Editorial', 'Opinion and analysis'),
    ('untold-stories', 'Untold Stories', 'Investigative journalism'),
    ('environment', 'Environment', 'Environmental news'),
    ('culture', 'Culture', 'Culture and heritage'),
    ('society', 'Society', 'Social issues and community')
ON CONFLICT (id) DO NOTHING;

-- Site Settings (ensure row exists)
INSERT INTO site_settings (id, site_name, tagline, site_description, contact_email)
VALUES (1, 'TruthLens', 'Your Lens to the Truth', 'TruthLens News Platform', 'contact@truthlens.com.bd')
ON CONFLICT (id) DO NOTHING;

-- Default Internship Benefits (only if empty)
INSERT INTO internship_benefits (icon_name, title, description, sort_order)
SELECT * FROM (VALUES
    ('BookOpen', 'Hands-on Experience', 'Work on real stories that get published and make an impact in the world.', 1),
    ('Users', 'Mentorship Program', 'Learn directly from experienced journalists and editors in the field.', 2),
    ('Globe', 'Global Exposure', 'Cover international stories and understand global media dynamics.', 3),
    ('Award', 'Certificate & Reference', 'Receive a certificate of completion and strong professional references.', 4),
    ('TrendingUp', 'Career Growth', 'Top performers get opportunities for full-time positions.', 5),
    ('Heart', 'Meaningful Work', 'Be part of authentic journalism that uncovers untold stories.', 6)
) AS t(icon_name, title, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM internship_benefits LIMIT 1);

-- Default Internship Departments (only if empty)
INSERT INTO internship_departments (icon_name, name, description, sort_order)
SELECT * FROM (VALUES
    ('Edit3', 'Editorial', 'News writing, fact-checking, and content editing', 1),
    ('Camera', 'Multimedia', 'Photography, videography, and visual storytelling', 2),
    ('Mic', 'Podcasting', 'Audio production and podcast creation', 3),
    ('Globe', 'Digital Media', 'Social media, SEO, and online engagement', 4)
) AS t(icon_name, name, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM internship_departments LIMIT 1);

-- Default Internship FAQs (only if empty)
INSERT INTO internship_faqs (question, answer, sort_order)
SELECT * FROM (VALUES
    ('What is the duration of the internship?', 'Our internships typically last 3-6 months, with flexibility based on your academic schedule.', 1),
    ('Is this a paid internship?', 'We offer stipends for our interns along with valuable experience and mentorship.', 2),
    ('Can I intern remotely?', 'Yes, we offer both remote and on-site internship options depending on your location and preferences.', 3),
    ('What qualifications do I need?', 'We welcome students and recent graduates with a passion for journalism. No prior professional experience required.', 4)
) AS t(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM internship_faqs LIMIT 1);


-- ========================
-- PART 8: DATABASE FUNCTIONS
-- ========================

-- Increment article views
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========================
-- PART 9: AUTH TRIGGER (creates author profile on signup)
-- ========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.authors (id, email, name, role, avatar, age, gender, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'reporter'),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id),
    COALESCE((new.raw_user_meta_data->>'age')::int, 0),
    COALESCE(new.raw_user_meta_data->>'gender', 'Not Specified'),
    COALESCE(new.raw_user_meta_data->>'status', 'pending')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.authors.name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ========================
-- PART 10: ENSURE ADMIN PROFILE EXISTS
-- ========================
INSERT INTO public.authors (id, email, name, role, status)
SELECT id, email, 'Hridoy Zaman', 'admin', 'active'
FROM auth.users
WHERE email = 'hridoyzaman1@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', status = 'active', name = 'Hridoy Zaman';


-- ========================
-- PART 11: STORAGE POLICIES (Fixes Media Upload)
-- ========================
-- This part ensures the 'media' bucket exists and has correct RLS policies.
-- NOTE: SUPABASE Dashboard usually handles bucket creation, but these policies are CRITICAL.

-- Allow Public Read Access to 'media' bucket
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('media', 'media', true) 
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
CREATE POLICY "Authenticated Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
CREATE POLICY "Authenticated Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');


-- ============================================================================
-- DONE! 
-- 
-- AFTER running this script, your site is fully synchronized and fixed.
-- ============================================================================
SELECT 'COMPLETE SQL SETUP FINISHED SUCCESSFULLY!' AS result;
