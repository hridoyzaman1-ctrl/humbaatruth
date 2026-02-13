-- ============================================================================
-- USER WORKFLOW & SIGNUP FIX (COMPLETE)
-- ============================================================================

-- 1. Create a robust handle_new_user function that AUTO-CONFIRMS emails
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
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.authors.name),
    status = COALESCE(EXCLUDED.status, public.authors.status);
    
  -- AUTO-CONFIRM EMAIL (Critical Fix)
  -- We trust the Admin Approval process, so we skip email verification.
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = new.id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create the PURGE function (Admin only logic)
CREATE OR REPLACE FUNCTION delete_user_entirely(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.authors WHERE id = target_user_id;
    DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RETROACTIVE FIX: Confirm ALL existing users
-- This fixes the issue for admins who are already "accepted" but can't login.
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
