-- TruthLens Database Schema Setup
-- Run this script in the Supabase SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Authors/Admins Table
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    bio TEXT,
    role TEXT CHECK (role IN ('admin', 'editor', 'journalist', 'author', 'reporter')) DEFAULT 'reporter',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE categories (
    id TEXT PRIMARY KEY, -- using slug as ID for simplicity in news (e.g. 'national')
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Articles Table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id),
    author_id UUID REFERENCES authors(id),
    featured_image TEXT,
    video_url TEXT,
    has_video BOOLEAN DEFAULT FALSE,
    show_on_homepage BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    is_breaking BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('draft', 'published', 'scheduled')) DEFAULT 'draft',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    views INTEGER DEFAULT 0
);

-- 5. Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    department TEXT,
    type TEXT CHECK (type IN ('full-time', 'part-time', 'internship', 'freelance', 'volunteer')) DEFAULT 'full-time',
    description TEXT,
    requirements TEXT[],
    deadline TIMESTAMPTZ,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Site Settings (Single Row Table)
CREATE TABLE site_settings (
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

-- Insert Initial Site Settings
INSERT INTO site_settings (id, site_name, tagline, site_description, contact_email)
VALUES (1, 'TruthLens', 'Authentic Stories. Unbiased Voices.', 'Your trusted source for fact-based journalism.', 'contact@truthlens.com')
ON CONFLICT (id) DO NOTHING;

-- 7. Activity Log
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES authors(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create Policies (Initial: Allow Read for all, Write for authenticated)
-- Note: In a production app, you'd refine these based on roles.
CREATE POLICY "Allow public read access" ON authors FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON jobs FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);

-- Allow admins to manage everything
-- (For now, we'll allow all authenticated users to manage data to make setup easy)
CREATE POLICY "Allow authenticated manage" ON authors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated manage" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated manage" ON articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated manage" ON jobs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated manage" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated manage" ON activity_log FOR ALL USING (auth.role() = 'authenticated');

-- 8. Seed Demo Authors (Optional, if using manual insert)
INSERT INTO authors (name, email, avatar, role)
VALUES 
    ('System Admin', 'admin@truthlens.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin'),
    ('News Editor', 'editor@truthlens.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor', 'editor')
ON CONFLICT (email) DO NOTHING;

-- 9. AUTOMATION: Trigger to create Author profile on Sign Up
-- This ensures that when a user creates an account in Supabase Auth,
-- a corresponding profile is created in the 'authors' table instantly.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.authors (id, email, name, role, avatar)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'reporter'),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email; -- ensuring email sync
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow safe upgrades
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Refined RLS Policies for Authors
-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Allow authenticated manage" ON authors;
CREATE POLICY "Allow individual update own profile" ON authors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admins to manage all" ON authors FOR ALL USING (
  exists (select 1 from authors where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Allow public read access" ON authors FOR SELECT USING (true);
