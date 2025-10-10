-- Drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Set id to have a default UUID generator
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Update the trigger to handle when a user signs in
-- If they already exist (by email), just mark them as not pending
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to update existing user with this email
  UPDATE public.users
  SET is_pending = false, updated_at = NOW()
  WHERE email = NEW.email;
  
  -- If no user exists with this email, insert new one
  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, roles, is_pending)
    VALUES (NEW.id, NEW.email, ARRAY['user'], false)
    ON CONFLICT (id) DO UPDATE 
    SET is_pending = false, updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
