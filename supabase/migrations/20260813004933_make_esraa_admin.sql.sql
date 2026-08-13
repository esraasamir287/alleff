/*
# Grant admin privileges to esraasamir287@gmail.com

1. Purpose
- The user esraasamir287@gmail.com (existing student profile: "esraa samir")
  needs access to the admin dashboard at /admin.
- This sets raw_app_meta_data.is_admin = true so the admin-auth-check edge
  function and AdminRoute guard recognise the account as an admin.

2. Changes
- Updates auth.users.raw_app_meta_data for user id
  12bd69f4-801f-4451-b747-0b57477d5f5b, preserving existing keys
  (provider, providers) and adding is_admin = true.

3. Security
- No table schema or RLS changes.
- Only the single, identified user is affected.
*/

UPDATE auth.users
SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb)
    || '{"is_admin": true}'::jsonb
WHERE id = '12bd69f4-801f-4451-b747-0b57477d5f5b';
