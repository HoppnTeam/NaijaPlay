-- Create leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    max_teams INTEGER DEFAULT 10,
    entry_fee BIGINT DEFAULT 0,
    is_private BOOLEAN DEFAULT false,
    join_code TEXT,
    status TEXT DEFAULT 'active'
);

-- Create league_members table
CREATE TABLE IF NOT EXISTS public.league_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    role TEXT DEFAULT 'member',
    UNIQUE(league_id, team_id),
    UNIQUE(league_id, user_id)
);

-- Create gameweeks table
CREATE TABLE IF NOT EXISTS public.gameweeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(number)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    match_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(gameweek_id, home_team_id, away_team_id)
);

-- Create match_events table
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    minute INTEGER,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create team_gameweek_stats table
CREATE TABLE IF NOT EXISTS public.team_gameweek_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, gameweek_id)
);

-- Create player_gameweek_stats table
CREATE TABLE IF NOT EXISTS public.player_gameweek_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    minutes_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    bonus_points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(player_id, gameweek_id, team_id)
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS public.token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token_id UUID REFERENCES public.tokens(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    payment_reference TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_tokens table
CREATE TABLE IF NOT EXISTS public.user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Add RLS policies for leagues
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all leagues" 
ON public.leagues FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create leagues" 
ON public.leagues FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own leagues" 
ON public.leagues FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

-- Add RLS policies for league_members
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view league members" 
ON public.league_members FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can join leagues" 
ON public.league_members FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for gameweeks
ALTER TABLE public.gameweeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all gameweeks" 
ON public.gameweeks FOR SELECT 
TO authenticated 
USING (true);

-- Add RLS policies for matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all matches" 
ON public.matches FOR SELECT 
TO authenticated 
USING (true);

-- Add RLS policies for match_events
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all match events" 
ON public.match_events FOR SELECT 
TO authenticated 
USING (true);

-- Add RLS policies for team_gameweek_stats
ALTER TABLE public.team_gameweek_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all team gameweek stats" 
ON public.team_gameweek_stats FOR SELECT 
TO authenticated 
USING (true);

-- Add RLS policies for player_gameweek_stats
ALTER TABLE public.player_gameweek_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all player gameweek stats" 
ON public.player_gameweek_stats FOR SELECT 
TO authenticated 
USING (true);

-- Add RLS policies for tokens
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all tokens" 
ON public.tokens FOR SELECT 
TO authenticated 
USING (true);

-- Add RLS policies for token_transactions
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token transactions" 
ON public.token_transactions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own token transactions" 
ON public.token_transactions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for user_tokens
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token balance" 
ON public.user_tokens FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables with updated_at column
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql; 