-- Drop existing objects
DROP VIEW IF EXISTS public.user_balances;
DROP TABLE IF EXISTS public.bets;

-- Create bets table
CREATE TABLE public.bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL CHECK (amount > 0),
    odds DECIMAL(10,2) NOT NULL,
    prediction TEXT NOT NULL CHECK (prediction IN ('home', 'draw', 'away')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_balances view
CREATE OR REPLACE VIEW public.user_balances AS
SELECT 
    w.user_id,
    w.balance,
    COALESCE(SUM(b.amount) FILTER (WHERE b.status = 'pending'), 0) as pending_bets,
    w.balance - COALESCE(SUM(b.amount) FILTER (WHERE b.status = 'pending'), 0) as available_balance
FROM public.wallets w
LEFT JOIN public.bets b ON w.user_id = b.user_id
GROUP BY w.user_id, w.balance;

-- Add RLS policies for bets
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Users can view their own bets
CREATE POLICY "Users can view their own bets"
    ON public.bets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can place bets
CREATE POLICY "Users can place bets"
    ON public.bets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Only system can update bets
CREATE POLICY "Only system can update bets"
    ON public.bets
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create function to update user balance when bet is placed
CREATE OR REPLACE FUNCTION update_balance_on_bet()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct bet amount from user's wallet
    UPDATE public.wallets
    SET balance = balance - NEW.amount
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user balance when bet is settled
CREATE OR REPLACE FUNCTION update_balance_on_bet_settlement()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'won' THEN
        -- Add winnings to user's wallet
        UPDATE public.wallets
        SET balance = balance + (NEW.amount * NEW.odds)::BIGINT
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS update_balance_on_bet_trigger ON public.bets;
CREATE TRIGGER update_balance_on_bet_trigger
    AFTER INSERT ON public.bets
    FOR EACH ROW
    EXECUTE FUNCTION update_balance_on_bet();

DROP TRIGGER IF EXISTS update_balance_on_bet_settlement_trigger ON public.bets;
CREATE TRIGGER update_balance_on_bet_settlement_trigger
    AFTER UPDATE ON public.bets
    FOR EACH ROW
    WHEN (OLD.status = 'pending' AND NEW.status = 'won')
    EXECUTE FUNCTION update_balance_on_bet_settlement(); 