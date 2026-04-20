-- Drop the temp passwords table (no longer needed - replaced by recovery links)
DROP TABLE IF EXISTS public.user_temp_passwords CASCADE;

-- Drop the must_change_password column (no longer needed - users set their own password via link)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS must_change_password;