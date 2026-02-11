-- FORCE ADMIN USER SCRIPT (FINAL FIX)
-- Handles "Duplicate Email" errors by removing mismatched profiles first.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'admin@truthlens.com';
  v_password text := 'admin123';
BEGIN
  -- 1. Get or Create the Auth User
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    -- Update existing Auth User
    UPDATE auth.users
    SET 
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = now(),
      raw_user_meta_data = '{"name":"System Admin","role":"admin"}',
      updated_at = now()
    WHERE id = v_user_id;
  ELSE
    -- Create new Auth User
    v_user_id := uuid_generate_v4();
    
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
      v_email, crypt(v_password, gen_salt('bf')), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"System Admin","role":"admin"}', 
      now(), now(), '', '', '', ''
    );
  END IF;

  -- 2. Clean up conflicting profiles in 'authors'
  -- If there is an 'authors' row with this email but a DIFFERENT ID, it blocks us.
  -- We delete it so we can insert the correct one linked to the Auth ID.
  DELETE FROM public.authors
  WHERE email = v_email AND id != v_user_id;

  -- 3. Sync the Correct Profile
  INSERT INTO public.authors (id, email, name, role, avatar)
  VALUES (v_user_id, v_email, 'System Admin', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin')
  ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    email = EXCLUDED.email;
    
  RAISE NOTICE 'Fixed Admin User. ID: %', v_user_id;
END $$;
