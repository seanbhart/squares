-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- Create a SECURITY DEFINER function to check if current user is admin
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now use the function in policies (no recursion since function is SECURITY DEFINER)
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (current_user_is_admin());

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (current_user_is_admin());

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (current_user_is_admin());
