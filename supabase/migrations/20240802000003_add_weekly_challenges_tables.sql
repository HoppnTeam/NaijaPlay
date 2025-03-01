-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_challenges;
DROP TABLE IF EXISTS public.weekly_challenges;

-- Create weekly_challenges table
CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_tokens INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_progress INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table to track user progress
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Add RLS policies for weekly_challenges
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Only admins can insert challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Only admins can update challenges" ON public.weekly_challenges;

CREATE POLICY "Anyone can view active challenges"
  ON public.weekly_challenges
  FOR SELECT
  USING (true);

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

-- Add RLS policies for user_challenges
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own challenge progress" ON public.user_challenges;
DROP POLICY IF EXISTS "System can insert user challenges" ON public.user_challenges;
DROP POLICY IF EXISTS "System can update user challenges" ON public.user_challenges;

CREATE POLICY "Users can view their own challenge progress"
  ON public.user_challenges
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user challenges"
  ON public.user_challenges
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update user challenges"
  ON public.user_challenges
  FOR UPDATE
  USING (true);

-- Create sample weekly challenges
INSERT INTO public.weekly_challenges (title, description, reward_tokens, start_date, end_date, max_progress)
VALUES
  ('Complete Team Setup', 'Set up your team with a full squad of 15 players', 20, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 1),
  ('Make 3 Transfers', 'Make 3 player transfers in your team', 15, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 3),
  ('Captain a Top Scorer', 'Select a captain who scores at least 10 points in a gameweek', 25, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 1),
  ('Visit Daily for 5 Days', 'Log in to the app for 5 consecutive days', 30, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 5),
  ('Complete Your Starting XI', 'Select your starting 11 players', 10, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 1)
ON CONFLICT DO NOTHING; 