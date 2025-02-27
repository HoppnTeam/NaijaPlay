-- Add function to use tokens for budget top-up
CREATE OR REPLACE FUNCTION public.use_tokens_for_budget(
  p_user_id UUID,
  p_team_id UUID,
  p_token_amount INTEGER,
  p_budget_increase BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_tokens INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Check if user has enough tokens
  SELECT tokens INTO v_current_tokens
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_current_tokens < p_token_amount THEN
    RAISE EXCEPTION 'Insufficient tokens';
  END IF;
  
  -- Begin transaction
  -- 1. Deduct tokens from user's profile
  UPDATE profiles
  SET tokens = tokens - p_token_amount
  WHERE id = p_user_id;
  
  -- 2. Increase team budget
  UPDATE teams
  SET budget = budget + p_budget_increase,
      updated_at = now()
  WHERE id = p_team_id
  AND user_id = p_user_id;
  
  -- 3. Record token transaction
  INSERT INTO token_transactions (
    user_id,
    amount,
    type,
    description,
    created_at
  ) VALUES (
    p_user_id,
    -p_token_amount,
    'usage',
    'Budget top-up for team ' || p_team_id,
    now()
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
    RETURN FALSE;
END;
$$; 