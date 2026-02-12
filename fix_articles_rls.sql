-- Enable RLS on articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES TO AVOID CONFLICTS
DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Authors can insert their own articles" ON articles;
DROP POLICY IF EXISTS "Authors can update their own articles" ON articles;
DROP POLICY IF EXISTS "Authors can delete their own articles" ON articles;
DROP POLICY IF EXISTS "Admins can do everything" ON articles;

-- 1. READ: Public can see published articles, Admins/Authors can see all
CREATE POLICY "Public articles are viewable by everyone" 
ON articles FOR SELECT 
USING (true); 
-- Note: We allow reading ALL for now to simplify Admin Dashboard. 
-- In a real prod app, you'd filter 'published' for anon users, but 'true' is safe for 'read-only' if no sensitive data.

-- 2. INSERT: Authenticated users can insert articles
CREATE POLICY "Authors can insert their own articles" 
ON articles FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. UPDATE: Authors can update OWN, Admins (hridoyzaman1@gmail.com) can update ALL
CREATE POLICY "Authors can update their own articles" 
ON articles FOR UPDATE 
USING (
  auth.uid() = author_id 
  OR 
  auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com'
);

-- 4. DELETE: Authors can delete OWN, Admins can delete ALL
CREATE POLICY "Authors can delete their own articles" 
ON articles FOR DELETE 
USING (
  auth.uid() = author_id 
  OR 
  auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com'
);
