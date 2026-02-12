-- Run this in the Supabase SQL Editor to add the increment_views function
-- and seed categories if they don't exist yet

-- 1. Seed categories (matches frontend expected slugs)
INSERT INTO categories (id, name, description) VALUES
    ('national', 'National', 'News from across the nation'),
    ('international', 'International', 'Global news and events'),
    ('economy', 'Economy', 'Business and financial news'),
    ('entertainment', 'Entertainment', 'Movies, music, and celebrity news'),
    ('sports', 'Sports', 'Sports news and highlights'),
    ('politics', 'Politics', 'Political news and analysis'),
    ('technology', 'Technology', 'Tech news and innovations'),
    ('editorial', 'Editorial', 'Opinion and analysis'),
    ('untold-stories', 'Untold Stories', 'Investigative journalism')
ON CONFLICT (id) DO NOTHING;

-- 2. Add views column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'views'
    ) THEN
        ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Create increment_views function
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure site_settings row exists (needed for featured/menu/section settings)
INSERT INTO site_settings (id, site_name, tagline, site_description, contact_email)
VALUES (1, 'TruthLens', 'Your Lens to the Truth', 'TruthLens News Platform', 'contact@truthlens.com.bd')
ON CONFLICT (id) DO NOTHING;
