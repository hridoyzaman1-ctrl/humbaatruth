-- NUCLEAR RLS RECURSION FIX
-- This script resets policies for both 'authors' and 'articles' to ensure NO circular references.

-- 1. CLEANUP: Drop all possible problematic policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON authors;
DROP POLICY IF EXISTS "Admins can view all profiles" ON authors;
DROP POLICY IF EXISTS "Users can view their own profile" ON authors;
DROP POLICY IF EXISTS "Users can update own profile" ON authors;
DROP POLICY IF EXISTS "Admins can update all profiles" ON authors;
DROP POLICY IF EXISTS "Super Admin Full Access" ON authors;
DROP POLICY IF EXISTS "Super Admin can update everyone" ON authors;

DROP POLICY IF EXISTS "Public can view articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON articles;
DROP POLICY IF EXISTS "Authors can update own articles" ON articles;
DROP POLICY IF EXISTS "Everyone can view articles" ON articles;

-- 2. AUTHORS: Create Simple Non-Recursive Policies
-- Reading authors is public (safe, no recursion)
CREATE POLICY "Public Read Authors" ON authors FOR SELECT USING (true);

-- Updating is restricted to OWNER or SUPER ADMIN (hardcoded check)
CREATE POLICY "Update Authors" ON authors FOR UPDATE 
USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');

-- Admin Full Access (Hardcoded email to bypass DB role lookup loop)
CREATE POLICY "Admin Full Authors" ON authors FOR ALL 
USING (auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');

-- 3. ARTICLES: Create Simple Policies
-- Reading articles is public
CREATE POLICY "Public Read Articles" ON articles FOR SELECT USING (true);

-- Creating articles is restricted to auth users
CREATE POLICY "Create Articles" ON articles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Updating articles (Owner or Super Admin)
CREATE POLICY "Update Articles" ON articles FOR UPDATE 
USING (auth.uid() = author_id OR auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');

-- Deleting articles (Owner or Super Admin)
CREATE POLICY "Delete Articles" ON articles FOR DELETE 
USING (auth.uid() = author_id OR auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');
