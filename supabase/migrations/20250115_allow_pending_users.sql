-- Add unique constraint on email (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;

-- Add a column to track if user is pending (hasn't signed in yet)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pending BOOLEAN DEFAULT false;

-- Update the trigger function to handle existing pending users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a pending user exists with this email
  UPDATE public.users
  SET is_pending = false, updated_at = NOW()
  WHERE email = NEW.email AND is_pending = true;
  
  -- If no pending user was updated, insert new user
  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, roles, is_pending)
    VALUES (NEW.id, NEW.email, ARRAY['user'], false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
