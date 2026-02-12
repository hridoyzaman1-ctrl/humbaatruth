-- ========================
-- PART 12: COMMENTS TABLE (Fixes Real Data & Moderation)
-- ========================

-- Drop existing table if any
DROP TABLE IF EXISTS public.comments CASCADE;

CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved', -- approved, pending, flagged, spam
    likes INTEGER NOT NULL DEFAULT 0,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public Read Access for approved comments
CREATE POLICY "Public Read Approved Comments" ON public.comments
    FOR SELECT USING (status = 'approved');

-- 2. Anyone can post a comment
CREATE POLICY "Anonymous Insert Comments" ON public.comments
    FOR INSERT WITH CHECK (true);

-- 3. Authenticated Users (Admins) can manage all
CREATE POLICY "Admins Manage All Comments" ON public.comments
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid() AND role = 'admin')
    );

-- Index for performance
CREATE INDEX idx_comments_article_id ON public.comments(article_id);
CREATE INDEX idx_comments_status ON public.comments(status);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Function to increment likes safely
CREATE OR REPLACE FUNCTION public.increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.comments
    SET likes = likes + 1
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
