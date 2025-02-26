-- Create a function to deduct from wallet
CREATE OR REPLACE FUNCTION deduct_from_wallet(p_user_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
DECLARE
  v_current_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM wallets
  WHERE user_id = p_user_id;
  
  -- Check if balance is sufficient
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;
  
  -- Update wallet balance
  UPDATE wallets
  SET balance = balance - p_amount
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description
  ) VALUES (
    p_user_id,
    p_amount * -1, -- negative amount for deduction
    'wallet_deduction',
    'completed',
    'Deduction from wallet'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add to wallet
CREATE OR REPLACE FUNCTION add_to_wallet(p_user_id UUID, p_amount NUMERIC, p_description TEXT DEFAULT 'Wallet top-up')
RETURNS VOID AS $$
BEGIN
  -- Update wallet balance
  UPDATE wallets
  SET balance = balance + p_amount
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    'wallet_topup',
    'completed',
    p_description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to transfer between wallets
CREATE OR REPLACE FUNCTION transfer_between_wallets(p_from_user_id UUID, p_to_user_id UUID, p_amount NUMERIC, p_description TEXT DEFAULT 'Wallet transfer')
RETURNS VOID AS $$
DECLARE
  v_from_balance NUMERIC;
BEGIN
  -- Get sender's balance
  SELECT balance INTO v_from_balance
  FROM wallets
  WHERE user_id = p_from_user_id;
  
  -- Check if balance is sufficient
  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance for transfer';
  END IF;
  
  -- Deduct from sender
  UPDATE wallets
  SET balance = balance - p_amount
  WHERE user_id = p_from_user_id;
  
  -- Add to recipient
  UPDATE wallets
  SET balance = balance + p_amount
  WHERE user_id = p_to_user_id;
  
  -- Record sender transaction
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description,
    metadata
  ) VALUES (
    p_from_user_id,
    p_amount * -1, -- negative amount for deduction
    'wallet_transfer_out',
    'completed',
    p_description,
    jsonb_build_object('recipient_id', p_to_user_id)
  );
  
  -- Record recipient transaction
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description,
    metadata
  ) VALUES (
    p_to_user_id,
    p_amount,
    'wallet_transfer_in',
    'completed',
    p_description,
    jsonb_build_object('sender_id', p_from_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 