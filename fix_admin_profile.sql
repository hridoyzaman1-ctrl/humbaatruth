-- EMERGENCY FIX: Restore Super Admin Profile
-- Run this in Supabase SQL Editor immediately.

INSERT INTO public.authors (id, email, name, role, status, age, gender)
SELECT 
  id, 
  email, 
  'Hridoy Zaman', -- Hardcoded Name
  'admin',        -- Hardcoded Role
  'active',       -- Hardcoded Status
  26,             -- Hardcoded Age
  'Male'          -- Hardcoded Gender
FROM auth.users 
WHERE email = 'hridoyzaman1@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  status = 'active',
  name = 'Hridoy Zaman';
