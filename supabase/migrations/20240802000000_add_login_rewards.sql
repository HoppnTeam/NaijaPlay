-- Create daily_logins table to track user logins
CREATE TABLE IF NOT EXISTS public.daily_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_awarded INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, login_date)
);

-- Add RLS policies for daily_logins
ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;

-- Users can view their own login records
CREATE POLICY "Users can view their own login records" 
ON public.daily_logins FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create weekly_challenges table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_tokens INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_challenges table to track user progress on challenges
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  max_progress INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Add RLS policies for weekly_challenges
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can view challenges
CREATE POLICY "Anyone can view challenges" 
ON public.weekly_challenges FOR SELECT 
USING (true);

-- Add RLS policies for user_challenges
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Users can view their own challenge progress
CREATE POLICY "Users can view their own challenge progress" 
ON public.user_challenges FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create function to record daily login and award tokens
CREATE OR REPLACE FUNCTION public.record_daily_login()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_last_login DATE;
  v_streak_count INTEGER := 1;
  v_tokens_to_award INTEGER := 5; -- Base daily login reward
  v_streak_bonus INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user already logged in today
  SELECT login_date INTO v_last_login
  FROM public.daily_logins
  WHERE user_id = v_user_id
  AND login_date = CURRENT_DATE;
  
  IF v_last_login IS NOT NULL THEN
    -- User already logged in today
    v_result := jsonb_build_object(
      'success', false,
      'message', 'Already claimed daily reward today',
      'tokens_awarded', 0,
      'streak_count', 0
    );
    RETURN v_result;
  END IF;
  
  -- Check for streak (consecutive days)
  SELECT 
    CASE 
      WHEN login_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_count + 1
      ELSE 1
    END INTO v_streak_count
  FROM public.daily_logins
  WHERE user_id = v_user_id
  ORDER BY login_date DESC
  LIMIT 1;
  
  -- Calculate streak bonus (1 extra token for every 5 days in streak)
  v_streak_bonus := FLOOR(v_streak_count / 5);
  v_tokens_to_award := v_tokens_to_award + v_streak_bonus;
  
  -- Record login
  INSERT INTO public.daily_logins (
    user_id,
    login_date,
    tokens_awarded,
    streak_count
  ) VALUES (
    v_user_id,
    CURRENT_DATE,
    v_tokens_to_award,
    v_streak_count
  );
  
  -- Award tokens to user
  UPDATE public.profiles
  SET tokens = tokens + v_tokens_to_award
  WHERE id = v_user_id;
  
  -- Record token transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    type,
    description,
    created_at
  ) VALUES (
    v_user_id,
    v_tokens_to_award,
    'reward',
    'Daily login reward (Day ' || v_streak_count || ')',
    now()
  );
  
  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Daily login reward claimed',
    'tokens_awarded', v_tokens_to_award,
    'streak_count', v_streak_count
  );
  
  RETURN v_result;
END;
$$; 