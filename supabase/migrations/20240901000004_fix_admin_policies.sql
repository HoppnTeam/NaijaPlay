-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Only admins can update challenges" ON public.weekly_challenges;

-- Recreate policies using profiles table
CREATE POLICY "Only admins can insert challenges"
  ON public.weekly_challenges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update challenges"
  ON public.weekly_challenges
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  ); 