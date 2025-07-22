-- Create the first admin user manually
-- Note: This is a one-time setup. In production, you would assign admin roles through the UI or API

-- Insert a sample admin user role
-- First, we need to get the user_id of an existing user, or we can update this after a user signs up
-- For now, let's create a function to make the first registered user an admin

CREATE OR REPLACE FUNCTION public.make_user_admin(_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Get the user_id from auth.users based on email
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = _email;
  
  -- If user doesn't exist, return false
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert admin role (ON CONFLICT DO NOTHING to avoid duplicate errors)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.make_user_admin(TEXT) TO authenticated;