-- Create function to claim challenge reward
CREATE OR REPLACE FUNCTION public.claim_challenge_reward(
  p_user_id UUID,
  p_challenge_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_exists BOOLEAN;
  v_is_completed BOOLEAN;
  v_is_claimed BOOLEAN;
  v_reward_tokens INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Check if challenge exists and is active
  SELECT EXISTS (
    SELECT 1 FROM public.weekly_challenges
    WHERE id = p_challenge_id
    AND is_active = true
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  ) INTO v_challenge_exists;
  
  IF NOT v_challenge_exists THEN
    RAISE EXCEPTION 'Challenge not found or not active';
  END IF;
  
  -- Get challenge reward amount
  SELECT reward_tokens INTO v_reward_tokens
  FROM public.weekly_challenges
  WHERE id = p_challenge_id;
  
  -- Check if user has completed the challenge
  SELECT 
    COALESCE(is_completed, false),
    COALESCE(is_claimed, false)
  INTO 
    v_is_completed,
    v_is_claimed
  FROM public.user_challenges
  WHERE user_id = p_user_id
  AND challenge_id = p_challenge_id;
  
  -- If no record exists, create one (not completed, not claimed)
  IF v_is_completed IS NULL THEN
    INSERT INTO public.user_challenges (
      user_id,
      challenge_id,
      progress,
      max_progress,
      is_completed,
      is_claimed
    ) VALUES (
      p_user_id,
      p_challenge_id,
      0,
      1,
      false,
      false
    );
    
    RAISE EXCEPTION 'Challenge not completed yet';
  END IF;
  
  -- Check if already claimed
  IF v_is_claimed THEN
    RAISE EXCEPTION 'Challenge reward already claimed';
  END IF;
  
  -- Check if completed
  IF NOT v_is_completed THEN
    RAISE EXCEPTION 'Challenge not completed yet';
  END IF;
  
  -- Mark challenge as claimed
  UPDATE public.user_challenges
  SET 
    is_claimed = true,
    claimed_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id
  AND challenge_id = p_challenge_id;
  
  -- Award tokens to user
  UPDATE public.profiles
  SET tokens = tokens + v_reward_tokens
  WHERE id = p_user_id;
  
  -- Record token transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    type,
    description,
    created_at
  ) VALUES (
    p_user_id,
    v_reward_tokens,
    'reward',
    'Weekly challenge reward for challenge ' || p_challenge_id,
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

-- Create function to update challenge progress
CREATE OR REPLACE FUNCTION public.update_challenge_progress(
  p_user_id UUID,
  p_challenge_id UUID,
  p_progress INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_exists BOOLEAN;
  v_max_progress INTEGER;
  v_current_progress INTEGER;
  v_is_completed BOOLEAN;
  v_is_claimed BOOLEAN;
BEGIN
  -- Check if challenge exists and is active
  SELECT EXISTS (
    SELECT 1 FROM public.weekly_challenges
    WHERE id = p_challenge_id
    AND is_active = true
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  ) INTO v_challenge_exists;
  
  IF NOT v_challenge_exists THEN
    RAISE EXCEPTION 'Challenge not found or not active';
  END IF;
  
  -- Get challenge max progress
  SELECT COALESCE(max_progress, 1) INTO v_max_progress
  FROM public.weekly_challenges
  WHERE id = p_challenge_id;
  
  -- Check if user challenge record exists
  SELECT 
    progress,
    is_completed,
    is_claimed
  INTO 
    v_current_progress,
    v_is_completed,
    v_is_claimed
  FROM public.user_challenges
  WHERE user_id = p_user_id
  AND challenge_id = p_challenge_id;
  
  -- If no record exists, create one
  IF v_current_progress IS NULL THEN
    INSERT INTO public.user_challenges (
      user_id,
      challenge_id,
      progress,
      max_progress,
      is_completed,
      is_claimed
    ) VALUES (
      p_user_id,
      p_challenge_id,
      p_progress,
      v_max_progress,
      p_progress >= v_max_progress,
      false
    );
    
    -- If completed, set completed_at
    IF p_progress >= v_max_progress THEN
      UPDATE public.user_challenges
      SET completed_at = now()
      WHERE user_id = p_user_id
      AND challenge_id = p_challenge_id;
    END IF;
    
    RETURN TRUE;
  END IF;
  
  -- If already claimed, don't update
  IF v_is_claimed THEN
    RETURN FALSE;
  END IF;
  
  -- Update progress
  UPDATE public.user_challenges
  SET 
    progress = p_progress,
    is_completed = p_progress >= v_max_progress,
    completed_at = CASE WHEN p_progress >= v_max_progress AND NOT v_is_completed THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE user_id = p_user_id
  AND challenge_id = p_challenge_id;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
    RETURN FALSE;
END;
$$; 