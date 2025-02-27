-- Create bets table for tracking user betting activity
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bet_type TEXT NOT NULL CHECK (bet_type IN ('team', 'player')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    potential_win NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    gameweek INTEGER NOT NULL,
    
    -- Team bet fields
    team1_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    selected_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team1_points INTEGER,
    team2_points INTEGER,
    
    -- Player bet fields
    player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    metric TEXT CHECK (metric IN ('goals', 'assists', 'clean_sheets', 'points')),
    prediction INTEGER,
    actual_value INTEGER,
    
    -- Constraints
    CONSTRAINT team_bet_fields_check CHECK (
        (bet_type = 'team' AND team1_id IS NOT NULL AND team2_id IS NOT NULL AND selected_team_id IS NOT NULL) OR
        (bet_type != 'team')
    ),
    CONSTRAINT player_bet_fields_check CHECK (
        (bet_type = 'player' AND player_id IS NOT NULL AND metric IS NOT NULL AND prediction IS NOT NULL) OR
        (bet_type != 'player')
    )
);

-- Create user_balances table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_id_unique UNIQUE (user_id)
);

-- Create function to update user balance when a bet is placed
CREATE OR REPLACE FUNCTION public.update_user_balance_on_bet()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct bet amount from user balance
    UPDATE public.user_balances
    SET 
        balance = balance - NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update user balance when a bet is placed
DROP TRIGGER IF EXISTS update_balance_on_bet_trigger ON public.bets;
CREATE TRIGGER update_balance_on_bet_trigger
BEFORE INSERT ON public.bets
FOR EACH ROW
EXECUTE FUNCTION public.update_user_balance_on_bet();

-- Create function to update user balance when a bet is settled
CREATE OR REPLACE FUNCTION public.update_user_balance_on_bet_settlement()
RETURNS TRIGGER AS $$
BEGIN
    -- If bet is won, add potential win to user balance
    IF NEW.status = 'won' AND OLD.status = 'pending' THEN
        UPDATE public.user_balances
        SET 
            balance = balance + NEW.potential_win,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    -- If bet is cancelled, refund the bet amount
    ELSIF NEW.status = 'cancelled' AND OLD.status = 'pending' THEN
        UPDATE public.user_balances
        SET 
            balance = balance + NEW.amount,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update user balance when a bet is settled
DROP TRIGGER IF EXISTS update_balance_on_bet_settlement_trigger ON public.bets;
CREATE TRIGGER update_balance_on_bet_settlement_trigger
AFTER UPDATE ON public.bets
FOR EACH ROW
WHEN (OLD.status != NEW.status)
EXECUTE FUNCTION public.update_user_balance_on_bet_settlement();

-- Add RLS policies
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bets"
ON public.bets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bets"
ON public.bets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for user_balances
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance"
ON public.user_balances
FOR SELECT
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS bets_user_id_idx ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS bets_status_idx ON public.bets(status);
CREATE INDEX IF NOT EXISTS bets_bet_type_idx ON public.bets(bet_type);
CREATE INDEX IF NOT EXISTS user_balances_user_id_idx ON public.user_balances(user_id); 