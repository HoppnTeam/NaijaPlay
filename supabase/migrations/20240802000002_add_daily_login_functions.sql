-- Create daily_logins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.daily_logins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  day INTEGER NOT NULL,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  tokens_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, login_date)
);

-- Add RLS policies for daily_logins
ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily logins"
  ON public.daily_logins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert daily logins"
  ON public.daily_logins
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update daily logins"
  ON public.daily_logins
  FOR UPDATE
  USING (true);

-- Create function to claim daily login reward
CREATE OR REPLACE FUNCTION public.claim_daily_login_reward(
  p_user_id UUID,
  p_day INTEGER,
  p_tokens INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_existing_login UUID;
  v_tokens_awarded INTEGER;
  v_result JSONB;
BEGIN
  -- Check if user has already claimed today
  SELECT id INTO v_existing_login
  FROM daily_logins
  WHERE user_id = p_user_id
    AND DATE(login_date) = v_today
    AND is_claimed = true;
  
  IF v_existing_login IS NOT NULL THEN
    RAISE EXCEPTION 'Daily reward already claimed today';
  END IF;
  
  -- Insert or update daily login record
  INSERT INTO daily_logins (
    user_id,
    login_date,
    day,
    is_claimed,
    tokens_awarded
  )
  VALUES (
    p_user_id,
    now(),
    p_day,
    true,
    p_tokens
  )
  ON CONFLICT (user_id, login_date)
  DO UPDATE SET
    is_claimed = true,
    day = p_day,
    tokens_awarded = p_tokens
  RETURNING tokens_awarded INTO v_tokens_awarded;
  
  -- Add tokens to user's balance
  UPDATE profiles
  SET tokens = tokens + v_tokens_awarded
  WHERE id = p_user_id;
  
  -- Record token transaction
  INSERT INTO token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  )
  VALUES (
    p_user_id,
    v_tokens_awarded,
    'daily_login',
    'Daily login reward - Day ' || p_day
  );
  
  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'tokens_awarded', v_tokens_awarded
  );
  
  RETURN v_result;
END;
$$; 