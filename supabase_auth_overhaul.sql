-- AUTH OVERHAUL SCRIPT
-- 1. Wipe Data
-- 2. Update Schema (Age, Gender, Status)
-- 3. Seed Super Admin (Hridoy Zaman)

-- PART 1: WIPE (Safe Delete)
DELETE FROM public.authors;
DELETE FROM auth.users;

-- PART 2: SCHEMA UPDATES
-- Add new columns if they don't exist
ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'; -- pending, active, rejected, suspended

-- Update the Trigger Function to capture new metadata and set defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.authors (id, email, name, role, avatar, age, gender, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'user'), -- Default role is 'user' (no access) until approved
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id),
    COALESCE((new.raw_user_meta_data->>'age')::int, 0),
    COALESCE(new.raw_user_meta_data->>'gender', 'Not Specified'),
    COALESCE(new.raw_user_meta_data->>'status', 'pending') -- Default status
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = EXCLUDED.name,
      age = EXCLUDED.age,
      gender = EXCLUDED.gender,
      status = EXCLUDED.status;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure Trigger is Active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- PART 3: SEED SUPER ADMIN
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_user_id uuid := uuid_generate_v4();
  v_email text := 'hridoyzaman1@gmail.com';
  v_password text := 'Youknowwho1';
  v_name text := 'Hridoy Zaman';
BEGIN
  -- Insert into auth.users (Correctly hashed password)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
    v_email, crypt(v_password, gen_salt('bf')), now(), now(),
    '{"provider":"email","providers":["email"]}', 
    jsonb_build_object(
        'name', v_name, 
        'role', 'admin', 
        'age', 26, 
        'gender', 'Male', 
        'status', 'active' -- Super Admin is ACTIVE immediately
    ), 
    now(), now(), '', '', '', ''
  );

  -- Trigger will handle public.authors insertion, but let's confirm/force status just in case trigger latency
  -- (Trigger runs AFTER INSERT, so it should be fine. But we can do an explicit update if needed.
  --  Actually, since it's a synchronous trigger, it runs in the same transaction.)
  
  RAISE NOTICE 'Super Admin Created: %', v_email;
END $$;
