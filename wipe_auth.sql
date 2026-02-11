-- NUCLEAR WIPE SCRIPT (FIXED)
-- Uses DELETE instead of TRUNCATE to avoid ownership errors.

-- 1. Delete all profiles (Foreign keys will cascade if configured, but we do it manually to be safe)
DELETE FROM public.authors;

-- 2. Delete all auth users
-- This triggers the cascade deletion of identities, etc. if set up, 
-- or we expect the triggers to handle related cleanups.
DELETE FROM auth.users;

-- 3. Drop the trigger/function (Cleanup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- DONE.
