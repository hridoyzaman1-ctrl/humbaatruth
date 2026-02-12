-- ============================================================================
-- TRUTHLENS MASTER SETUP SCRIPT (FIXED & IDEMPOTENT)
-- ============================================================================
-- This ONE script replaces ALL previous SQL scripts.
-- It is SAFE TO RUN MULTIPLE TIMES (fully idempotent).
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query).
-- ============================================================================

-- ========================
-- STEP 1: EXTENSIONS
-- ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- STEP 2: CREATE TABLES (IF NOT EXIST)
-- ========================

-- Authors/Users Table
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

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles Table
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

-- Jobs Table
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

-- Site Settings Table (single-row table)
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

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES authors(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- STEP 3: ADD MISSING COLUMNS (safe, idempotent)
-- ========================
DO $$
BEGIN
    -- articles.views
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='articles' AND column_name='views') THEN
        ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
    -- articles.custom_author
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='articles' AND column_name='custom_author') THEN
        ALTER TABLE articles ADD COLUMN custom_author TEXT;
    END IF;
    -- authors.age
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='authors' AND column_name='age') THEN
        ALTER TABLE authors ADD COLUMN age INTEGER;
    END IF;
    -- authors.gender
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='authors' AND column_name='gender') THEN
        ALTER TABLE authors ADD COLUMN gender TEXT;
    END IF;
    -- authors.status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='authors' AND column_name='status') THEN
        ALTER TABLE authors ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- ========================
-- STEP 4: ENABLE RLS ON ALL TABLES
-- ========================
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ========================
-- STEP 5: DROP ALL EXISTING POLICIES (NUCLEAR CLEANUP)
-- This removes EVERY policy from all previous scripts to avoid conflicts.
-- ========================

-- AUTHORS policies (from all scripts)
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

-- ARTICLES policies (from all scripts)
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
-- NEW POLICIES DROP (ADDED FIX)
DROP POLICY IF EXISTS "articles_select_policy" ON articles;
DROP POLICY IF EXISTS "articles_insert_policy" ON articles;
DROP POLICY IF EXISTS "articles_update_policy" ON articles;
DROP POLICY IF EXISTS "articles_delete_policy" ON articles;

-- CATEGORIES policies
DROP POLICY IF EXISTS "Allow public read access" ON categories;
DROP POLICY IF EXISTS "Allow authenticated manage" ON categories;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_manage_policy" ON categories;

-- JOBS policies
DROP POLICY IF EXISTS "Allow public read access" ON jobs;
DROP POLICY IF EXISTS "Allow authenticated manage" ON jobs;
DROP POLICY IF EXISTS "jobs_select_policy" ON jobs;
DROP POLICY IF EXISTS "jobs_manage_policy" ON jobs;

-- SITE_SETTINGS policies
DROP POLICY IF EXISTS "Allow public read access" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated manage" ON site_settings;
DROP POLICY IF EXISTS "site_settings_select_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_manage_policy" ON site_settings;

-- ACTIVITY_LOG policies
DROP POLICY IF EXISTS "Allow authenticated manage" ON activity_log;
DROP POLICY IF EXISTS "activity_log_manage_policy" ON activity_log;

-- ========================
-- STEP 6: CREATE CLEAN, SIMPLE, NON-RECURSIVE POLICIES
-- ========================
-- RULE: NEVER check the 'authors' table inside an 'authors' policy.
-- We use auth.jwt() for admin checks to avoid recursion.

-- ---- AUTHORS ----
-- Everyone can read (needed for article author display)
CREATE POLICY "authors_select_policy" ON authors
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "authors_update_policy" ON authors
  FOR UPDATE USING (auth.uid() = id);

-- Admin full access (hardcoded email check = NO recursion)
CREATE POLICY "authors_admin_policy" ON authors
  FOR ALL USING (auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');

-- ---- CATEGORIES ----
-- Everyone can read
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT USING (true);

-- Authenticated users can manage
CREATE POLICY "categories_manage_policy" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- ---- ARTICLES ----
-- Everyone can read
CREATE POLICY "articles_select_policy" ON articles
  FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "articles_insert_policy" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authors can update own articles OR admin can update all
CREATE POLICY "articles_update_policy" ON articles
  FOR UPDATE USING (
    auth.uid() = author_id
    OR auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com'
  );

-- Authors can delete own articles OR admin can delete all
CREATE POLICY "articles_delete_policy" ON articles
  FOR DELETE USING (
    auth.uid() = author_id
    OR auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com'
  );

-- ---- JOBS ----
CREATE POLICY "jobs_select_policy" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "jobs_manage_policy" ON jobs
  FOR ALL USING (auth.role() = 'authenticated');

-- ---- SITE_SETTINGS ----
CREATE POLICY "site_settings_select_policy" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings_manage_policy" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ---- ACTIVITY_LOG ----
CREATE POLICY "activity_log_manage_policy" ON activity_log
  FOR ALL USING (auth.role() = 'authenticated');

-- ========================
-- STEP 7: SEED CATEGORIES
-- ========================
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

-- ========================
-- STEP 8: SEED SITE SETTINGS (ensures the row exists)
-- ========================
INSERT INTO site_settings (id, site_name, tagline, site_description, contact_email)
VALUES (1, 'TruthLens', 'Your Lens to the Truth', 'TruthLens News Platform', 'contact@truthlens.com.bd')
ON CONFLICT (id) DO NOTHING;

-- ========================
-- STEP 9: CREATE DATABASE FUNCTIONS
-- ========================

-- increment_views function (called from frontend)
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================
-- STEP 10: AUTH TRIGGER (creates author profile on signup)
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

-- Re-create trigger (safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================
-- STEP 11: ENSURE ADMIN PROFILE EXISTS
-- ========================
-- Sync admin from auth.users → authors (if they already signed up)
INSERT INTO public.authors (id, email, name, role, status)
SELECT id, email, 'Hridoy Zaman', 'admin', 'active'
FROM auth.users
WHERE email = 'hridoyzaman1@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', status = 'active', name = 'Hridoy Zaman';

-- ============================================================================
-- DONE! This script is safe to run multiple times.
-- After running, refresh your admin panel and everything should work.
-- ============================================================================