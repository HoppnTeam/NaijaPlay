-- Add league owner incentives system
CREATE TABLE IF NOT EXISTS public.league_owner_incentives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    incentive_type TEXT NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(league_id, incentive_type)
);

-- Add incentive_balance to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS incentive_balance BIGINT DEFAULT 0;

-- Add RLS policies for league_owner_incentives
ALTER TABLE public.league_owner_incentives ENABLE ROW LEVEL SECURITY;

-- League owners can view their incentives
CREATE POLICY "League owners can view their incentives" 
ON public.league_owner_incentives FOR SELECT 
TO authenticated 
USING (owner_id = auth.uid());

-- Only the system can insert/update incentives
CREATE POLICY "System can manage incentives" 
ON public.league_owner_incentives FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create function to calculate and award league owner incentives
CREATE OR REPLACE FUNCTION calculate_league_owner_incentives(p_league_id UUID)
RETURNS VOID AS $$
DECLARE
    v_owner_id UUID;
    v_entry_fee BIGINT;
    v_max_teams INTEGER;
    v_current_teams INTEGER;
    v_total_entry_fees BIGINT;
    v_platform_fee BIGINT;
    v_base_incentive BIGINT;
    v_activity_bonus BIGINT;
    v_total_incentive BIGINT;
BEGIN
    -- Get league details
    SELECT 
        created_by, 
        entry_fee, 
        max_teams,
        (SELECT COUNT(*) FROM public.league_members WHERE league_id = l.id)
    INTO 
        v_owner_id, 
        v_entry_fee, 
        v_max_teams,
        v_current_teams
    FROM public.leagues l
    WHERE l.id = p_league_id;
    
    -- Calculate total entry fees
    v_total_entry_fees := v_entry_fee * v_current_teams;
    
    -- Calculate platform fee (10%)
    v_platform_fee := v_total_entry_fees * 0.1;
    
    -- Base incentive: 5% of total entry fees
    v_base_incentive := v_total_entry_fees * 0.05;
    
    -- Activity bonus: Additional 5% if league is at least 75% full
    IF (v_current_teams::float / v_max_teams::float) >= 0.75 THEN
        v_activity_bonus := v_total_entry_fees * 0.05;
    ELSE
        v_activity_bonus := 0;
    END IF;
    
    -- Total incentive
    v_total_incentive := v_base_incentive + v_activity_bonus;
    
    -- Insert or update base incentive
    INSERT INTO public.league_owner_incentives (
        league_id, 
        owner_id, 
        incentive_type, 
        amount, 
        description
    ) VALUES (
        p_league_id,
        v_owner_id,
        'base_commission',
        v_base_incentive,
        'Base commission (5% of entry fees)'
    ) ON CONFLICT (league_id, incentive_type) 
    DO UPDATE SET 
        amount = v_base_incentive,
        updated_at = now();
    
    -- Insert or update activity bonus
    INSERT INTO public.league_owner_incentives (
        league_id, 
        owner_id, 
        incentive_type, 
        amount, 
        description
    ) VALUES (
        p_league_id,
        v_owner_id,
        'activity_bonus',
        v_activity_bonus,
        'Activity bonus for high participation (5% of entry fees)'
    ) ON CONFLICT (league_id, incentive_type) 
    DO UPDATE SET 
        amount = v_activity_bonus,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to claim incentives
CREATE OR REPLACE FUNCTION claim_league_owner_incentives(p_league_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_owner_id UUID;
    v_total_amount BIGINT := 0;
BEGIN
    -- Get league owner
    SELECT created_by INTO v_owner_id
    FROM public.leagues
    WHERE id = p_league_id;
    
    -- Check if user is the league owner
    IF v_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'Only the league owner can claim incentives';
    END IF;
    
    -- Calculate total unclaimed incentives
    SELECT COALESCE(SUM(amount), 0) INTO v_total_amount
    FROM public.league_owner_incentives
    WHERE league_id = p_league_id
    AND owner_id = auth.uid()
    AND is_claimed = false;
    
    -- Mark incentives as claimed
    UPDATE public.league_owner_incentives
    SET is_claimed = true,
        updated_at = now()
    WHERE league_id = p_league_id
    AND owner_id = auth.uid()
    AND is_claimed = false;
    
    -- Add to user's incentive balance
    UPDATE public.profiles
    SET incentive_balance = incentive_balance + v_total_amount
    WHERE id = auth.uid();
    
    RETURN v_total_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to calculate incentives when a new member joins a league
CREATE OR REPLACE FUNCTION trigger_calculate_league_incentives()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_league_owner_incentives(NEW.league_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to league_members table
DROP TRIGGER IF EXISTS on_league_member_added ON public.league_members;
CREATE TRIGGER on_league_member_added
AFTER INSERT ON public.league_members
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_league_incentives();

-- Add trigger for updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at ON public.league_owner_incentives;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.league_owner_incentives
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 