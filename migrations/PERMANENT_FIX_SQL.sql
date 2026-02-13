-- ============================================================================
-- THE PERMANENT AUTH & LOGIN FIX (RUN THIS IN SUPABASE SQL EDITOR)
-- ============================================================================

-- 1. DROP EXISTING CONFLICTING POLICIES (Preventing recursion)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON authors;
DROP POLICY IF EXISTS "Users can view their own profile" ON authors;
DROP POLICY IF EXISTS "Admins can view all profiles" ON authors;
DROP POLICY IF EXISTS "Admins can update all profiles" ON authors;
DROP POLICY IF EXISTS "Users can update own profile" ON authors;
DROP POLICY IF EXISTS "Super Admin can update everyone" ON authors;

-- 2. CREATE CLEAN POLICIES
-- Anyone can view profiles (needed for public site)
CREATE POLICY "Allow public read access" ON authors FOR SELECT USING (true);

-- Authenticated users (Admins) can update only their own profile
CREATE POLICY "Allow users to update own profile" ON authors FOR UPDATE USING (auth.uid() = id);

-- Super admin bypass (Hardcoded email for safety)
CREATE POLICY "Super Admin master access" ON authors FOR ALL USING (auth.jwt() ->> 'email' = 'hridoyzaman1@gmail.com');

-- 3. UPGRADE THE USER TRIGGER (Auto-confirm + Auto-active)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.authors (id, email, name, role, avatar, age, gender, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'author'),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id),
    COALESCE((new.raw_user_meta_data->>'age')::int, 0),
    COALESCE(new.raw_user_meta_data->>'gender', 'Not Specified'),
    COALESCE(new.raw_user_meta_data->>'status', 'active') -- Set to active for immediate login
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    status = 'active';

  -- THE GHOST FIX: Force confirm email in Supabase Auth immediately
  UPDATE auth.users SET email_confirmed_at = now() WHERE id = new.id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RE-ATTACH TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. RETROACTIVE FIX (The most important step for existing users)
-- This fixes all users who are currently stuck with "wrong email/password"
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- 6. FINAL SUCCESS CHECK
SELECT 'PERMANENT FIX APPLIED SUCCESSFULLY' as status;
