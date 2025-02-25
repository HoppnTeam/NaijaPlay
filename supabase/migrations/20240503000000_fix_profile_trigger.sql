-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Create an updated function to handle new user signups with proper timestamp handling
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the user with proper timestamp handling
  -- Using the same timestamp format as the auth.users table to ensure consistency
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'user',
    NEW.created_at,  -- Use the same timestamp from the auth.users table
    NEW.created_at   -- Use the same timestamp from the auth.users table
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Make sure RLS policies exist for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure policies exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END;
$$; 