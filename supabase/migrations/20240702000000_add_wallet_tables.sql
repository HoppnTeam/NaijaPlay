-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet" 
ON public.wallets FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" 
ON public.wallets FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Add RLS policies for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
DROP TRIGGER IF EXISTS set_updated_at ON public.wallets;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.transactions;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create a trigger to create a wallet for new users
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance)
    VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_create_wallet ON auth.users;
CREATE TRIGGER on_user_created_create_wallet
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_wallet_for_new_user();

-- Create aliases for backward compatibility
DROP VIEW IF EXISTS public.user_balances;
CREATE VIEW public.user_balances AS
SELECT id, user_id, balance, created_at, updated_at
FROM public.wallets;

DROP VIEW IF EXISTS public.wallet_transactions;
CREATE VIEW public.wallet_transactions AS
SELECT id, user_id, amount, type, status, description, metadata, created_at, updated_at
FROM public.transactions;

-- Update wallet functions to use the new tables
DROP FUNCTION IF EXISTS public.deduct_from_wallet(UUID, NUMERIC);
CREATE OR REPLACE FUNCTION deduct_from_wallet(p_user_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_current_balance NUMERIC;
BEGIN
    -- Get current balance
    SELECT balance INTO v_current_balance
    FROM public.wallets
    WHERE user_id = p_user_id;
    
    -- Check if balance is sufficient
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    -- Update wallet balance
    UPDATE public.wallets
    SET balance = balance - p_amount
    WHERE user_id = p_user_id;
    
    -- Record transaction
    INSERT INTO public.transactions (
        user_id, amount, type, status, description
    ) VALUES (
        p_user_id, -p_amount, 'debit', 'completed', 'Wallet deduction'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.add_to_wallet(UUID, NUMERIC, TEXT);
CREATE OR REPLACE FUNCTION add_to_wallet(p_user_id UUID, p_amount NUMERIC, p_description TEXT DEFAULT 'Wallet top-up')
RETURNS VOID AS $$
BEGIN
    -- Update wallet balance
    UPDATE public.wallets
    SET balance = balance + p_amount
    WHERE user_id = p_user_id;
    
    -- Record transaction
    INSERT INTO public.transactions (
        user_id, amount, type, status, description
    ) VALUES (
        p_user_id, p_amount, 'credit', 'completed', p_description
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.transfer_between_wallets(UUID, UUID, NUMERIC, TEXT);
CREATE OR REPLACE FUNCTION transfer_between_wallets(p_from_user_id UUID, p_to_user_id UUID, p_amount NUMERIC, p_description TEXT DEFAULT 'Wallet transfer')
RETURNS VOID AS $$
DECLARE
    v_current_balance NUMERIC;
BEGIN
    -- Get current balance of sender
    SELECT balance INTO v_current_balance
    FROM public.wallets
    WHERE user_id = p_from_user_id;
    
    -- Check if balance is sufficient
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    -- Update sender's wallet balance
    UPDATE public.wallets
    SET balance = balance - p_amount
    WHERE user_id = p_from_user_id;
    
    -- Update recipient's wallet balance
    UPDATE public.wallets
    SET balance = balance + p_amount
    WHERE user_id = p_to_user_id;
    
    -- Record sender transaction
    INSERT INTO public.transactions (
        user_id, amount, type, status, description, metadata
    ) VALUES (
        p_from_user_id, -p_amount, 'transfer_out', 'completed', p_description, 
        jsonb_build_object('recipient_id', p_to_user_id)
    );
    
    -- Record recipient transaction
    INSERT INTO public.transactions (
        user_id, amount, type, status, description, metadata
    ) VALUES (
        p_to_user_id, p_amount, 'transfer_in', 'completed', p_description,
        jsonb_build_object('sender_id', p_from_user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 