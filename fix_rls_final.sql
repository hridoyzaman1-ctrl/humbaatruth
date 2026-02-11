-- FINAL RLS FIX (NUCLEAR OPTION)
-- We must drop ALL policies that might be causing recursion.

-- 1. Drop Policies from 'supabase_setup.sql' (The likely culprits)
DROP POLICY IF EXISTS "Allow admins to manage all" ON authors;
DROP POLICY IF EXISTS "Allow authenticated manage" ON authors;
DROP POLICY IF EXISTS "Allow individual update own profile" ON authors;
DROP POLICY IF EXISTS "Allow public read access" ON authors;

-- 2. Drop Policies from my previous attempts (Just in case)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON authors;
DROP POLICY IF EXISTS "Users can view their own profile" ON authors;
DROP POLICY IF EXISTS "Admins can view all profiles" ON authors;
DROP POLICY IF EXISTS "Admins can update all profiles" ON authors;
DROP POLICY IF EXISTS "Users can update own profile" ON authors;
DROP POLICY IF EXISTS "Super Admin can update everyone" ON authors;

-- 3. Re-create Non-Recursive Policies
-- Everyone can read basics needed for UI
CREATE POLICY "Public profiles are viewable by everyone" 
ON authors FOR SELECT 
USING (true); 

-- Users can update their OWN profile
CREATE POLICY "Users can update own profile" 
ON authors FOR UPDATE 
USING (auth.uid() = id);

-- Super Admin can update everyone (Hardcoded safety check to avoid recursion)
CREATE POLICY "Super Admin can update everyone" 
ON authors FOR ALL 
USING (auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');
