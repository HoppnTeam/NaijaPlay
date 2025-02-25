-- Add full_name column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update the trigger function to include full_name
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Create an updated function to handle new user signups with proper fields
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the user with all required fields
  INSERT INTO public.profiles (
    id, 
    email, 
    role,
    full_name,
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'user',
    NEW.raw_user_meta_data->>'full_name',
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup(); 