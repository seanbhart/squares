-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- Change role column to roles array
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users ADD COLUMN roles TEXT[] DEFAULT ARRAY['user']::TEXT[];

-- Create index on roles for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);

-- Update the is_admin function to check for 'admin' in roles array
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND 'admin' = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to read all users (no recursion - direct array check)
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- Allow admins to update users
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- Allow admins to insert users
CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- Update existing users to have roles array (if any exist)
UPDATE users SET roles = ARRAY['user']::TEXT[] WHERE roles IS NULL;
UPDATE users SET roles = ARRAY['admin']::TEXT[] WHERE email IN (
  SELECT email FROM auth.users LIMIT 1
) RETURNING *;

-- Note: After running this migration, manually update your admin user:
-- UPDATE users SET roles = ARRAY['admin'] WHERE email = 'your-email@gmail.com';
