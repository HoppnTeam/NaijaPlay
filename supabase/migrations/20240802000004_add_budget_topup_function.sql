-- Create function to top up team budget using tokens
CREATE OR REPLACE FUNCTION public.top_up_team_budget(
  p_user_id UUID,
  p_team_id UUID,
  p_tokens INTEGER,
  p_budget_increase NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_tokens INTEGER;
  v_team_budget NUMERIC;
  v_result JSONB;
BEGIN
  -- Check if user has enough tokens
  SELECT tokens INTO v_user_tokens
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_tokens IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  IF v_user_tokens < p_tokens THEN
    RAISE EXCEPTION 'Insufficient tokens';
  END IF;
  
  -- Check if team exists and belongs to user
  SELECT budget INTO v_team_budget
  FROM teams
  WHERE id = p_team_id AND user_id = p_user_id;
  
  IF v_team_budget IS NULL THEN
    RAISE EXCEPTION 'Team not found or does not belong to user';
  END IF;
  
  -- Deduct tokens from user
  UPDATE profiles
  SET tokens = tokens - p_tokens
  WHERE id = p_user_id;
  
  -- Increase team budget
  UPDATE teams
  SET 
    budget = budget + p_budget_increase,
    updated_at = now()
  WHERE id = p_team_id;
  
  -- Record token transaction
  INSERT INTO token_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    reference_id
  )
  VALUES (
    p_user_id,
    -p_tokens,
    'budget_top_up',
    'Budget top-up: ' || p_budget_increase || 'M',
    p_team_id
  );
  
  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'tokens_used', p_tokens,
    'budget_increase', p_budget_increase,
    'new_budget', v_team_budget + p_budget_increase
  );
  
  RETURN v_result;
END;
$$;