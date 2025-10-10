-- Update the trigger to handle pending users by email
-- When a user signs in, check if they already exist (pending) and update their ID
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a pending user exists with this email
  UPDATE public.users
  SET is_pending = false, updated_at = NOW()
  WHERE email = NEW.email AND id = NEW.id;
  
  -- If no user was updated, insert new user
  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, roles, is_pending)
    VALUES (NEW.id, NEW.email, ARRAY['user'], false)
    ON CONFLICT (id) DO UPDATE 
    SET is_pending = false, updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
