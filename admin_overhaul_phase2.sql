-- ============================================================================
-- TRUTHLENS ADMIN OVERHAUL PHASE 2
-- ============================================================================
-- Run this in your Supabase SQL Editor BEFORE deploying the new code.
-- Safe to run multiple times (fully idempotent).
-- ============================================================================

-- ========================
-- 1. ADD NEW COLUMNS TO site_settings
-- ========================
DO $$
BEGIN
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
-- 2. MEDIA TABLE (metadata for uploaded files)
-- ========================
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'image',  -- 'image', 'video', 'document'
    size_bytes BIGINT DEFAULT 0,
    mime_type TEXT,
    uploaded_by UUID REFERENCES authors(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Media" ON media;
DROP POLICY IF EXISTS "Auth Manage Media" ON media;
CREATE POLICY "Public Read Media" ON media FOR SELECT USING (true);
CREATE POLICY "Auth Manage Media" ON media FOR ALL USING (auth.uid() IS NOT NULL);

-- ========================
-- 3. INTERNSHIP TABLES
-- ========================

-- Benefits
CREATE TABLE IF NOT EXISTS internship_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icon_name TEXT DEFAULT 'Star',
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_benefits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Benefits" ON internship_benefits;
DROP POLICY IF EXISTS "Auth Manage Benefits" ON internship_benefits;
CREATE POLICY "Public Read Benefits" ON internship_benefits FOR SELECT USING (true);
CREATE POLICY "Auth Manage Benefits" ON internship_benefits FOR ALL USING (auth.uid() IS NOT NULL);

-- Departments
CREATE TABLE IF NOT EXISTS internship_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icon_name TEXT DEFAULT 'Briefcase',
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Departments" ON internship_departments;
DROP POLICY IF EXISTS "Auth Manage Departments" ON internship_departments;
CREATE POLICY "Public Read Departments" ON internship_departments FOR SELECT USING (true);
CREATE POLICY "Auth Manage Departments" ON internship_departments FOR ALL USING (auth.uid() IS NOT NULL);

-- FAQs
CREATE TABLE IF NOT EXISTS internship_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read FAQs" ON internship_faqs;
DROP POLICY IF EXISTS "Auth Manage FAQs" ON internship_faqs;
CREATE POLICY "Public Read FAQs" ON internship_faqs FOR SELECT USING (true);
CREATE POLICY "Auth Manage FAQs" ON internship_faqs FOR ALL USING (auth.uid() IS NOT NULL);

-- Applications
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
    status TEXT DEFAULT 'pending',  -- pending, reviewed, shortlisted, rejected
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Insert Applications" ON internship_applications;
DROP POLICY IF EXISTS "Auth Read Applications" ON internship_applications;
DROP POLICY IF EXISTS "Auth Manage Applications" ON internship_applications;
CREATE POLICY "Public Insert Applications" ON internship_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth Read Applications" ON internship_applications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth Manage Applications" ON internship_applications FOR ALL USING (auth.uid() IS NOT NULL);

-- ========================
-- 4. SEED DEFAULTS (only if tables are empty)
-- ========================

-- Seed default benefits
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

-- Seed default departments
INSERT INTO internship_departments (icon_name, name, description, sort_order)
SELECT * FROM (VALUES
    ('Edit3', 'Editorial', 'News writing, fact-checking, and content editing', 1),
    ('Camera', 'Multimedia', 'Photography, videography, and visual storytelling', 2),
    ('Mic', 'Podcasting', 'Audio production and podcast creation', 3),
    ('Globe', 'Digital Media', 'Social media, SEO, and online engagement', 4)
) AS t(icon_name, name, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM internship_departments LIMIT 1);

-- Seed default FAQs
INSERT INTO internship_faqs (question, answer, sort_order)
SELECT * FROM (VALUES
    ('What is the duration of the internship?', 'Our internships typically last 3-6 months, with flexibility based on your academic schedule.', 1),
    ('Is this a paid internship?', 'We offer stipends for our interns along with valuable experience and mentorship.', 2),
    ('Can I intern remotely?', 'Yes, we offer both remote and on-site internship options depending on your location and preferences.', 3),
    ('What qualifications do I need?', 'We welcome students and recent graduates with a passion for journalism. No prior professional experience required.', 4)
) AS t(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM internship_faqs LIMIT 1);

-- ========================
-- 5. SUPABASE STORAGE BUCKET FOR MEDIA
-- ========================
-- NOTE: You ALSO need to create a Storage Bucket in the Supabase Dashboard:
--   1. Go to Storage → Create a new bucket
--   2. Name: "media"
--   3. Toggle "Public bucket" = ON
--   4. File size limit: 10485760 (10MB)
--   5. Allowed MIME types: image/*, video/*, application/pdf, 
--      application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--      text/plain
--
-- Then create these storage policies in the SQL editor:

-- Allow public to read files from the media bucket
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 'Public Read', 'media', 'SELECT', '(true)'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies WHERE bucket_id = 'media' AND name = 'Public Read'
);

-- Allow authenticated users to upload
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 'Auth Upload', 'media', 'INSERT', '(auth.uid() IS NOT NULL)'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies WHERE bucket_id = 'media' AND name = 'Auth Upload'
);

-- Allow authenticated users to delete
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 'Auth Delete', 'media', 'DELETE', '(auth.uid() IS NOT NULL)'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.policies WHERE bucket_id = 'media' AND name = 'Auth Delete'
);

SELECT 'Phase 2 SQL complete!' AS result;
