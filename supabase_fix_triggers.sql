-- SAFE UPDATE SCRIPT
-- Run this to fix the RLS and Triggers without errors.

-- 1. Create the Function to handle new users
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
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-create the Trigger (Safely)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Update RLS Policies (Safely)
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated manage" ON authors;
DROP POLICY IF EXISTS "Allow individual update own profile" ON authors;
DROP POLICY IF EXISTS "Allow admins to manage all" ON authors;
DROP POLICY IF EXISTS "Allow public read access" ON authors;

-- Re-create Policies
CREATE POLICY "Allow public read access" ON authors FOR SELECT USING (true);

CREATE POLICY "Allow individual update own profile" ON authors FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admins to manage all" ON authors FOR ALL USING (
  exists (select 1 from authors where id = auth.uid() and role = 'admin')
);

-- 4. Ensure System Admin exists (Idempotent)
INSERT INTO authors (name, email, avatar, role)
VALUES 
    ('System Admin', 'admin@truthlens.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin')
ON CONFLICT (email) DO NOTHING;
