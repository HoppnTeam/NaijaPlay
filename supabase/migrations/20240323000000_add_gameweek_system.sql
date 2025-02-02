-- Create gameweeks table
CREATE TABLE IF NOT EXISTS public.gameweeks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_history table
CREATE TABLE IF NOT EXISTS public.match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  match_events JSONB DEFAULT '[]',
  player_performances JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_gameweek_stats table
CREATE TABLE IF NOT EXISTS public.team_gameweek_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  points_on_bench INTEGER DEFAULT 0,
  transfers_made INTEGER DEFAULT 0,
  transfers_cost INTEGER DEFAULT 0,
  captain_points INTEGER DEFAULT 0,
  vice_captain_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, gameweek_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_match_history_gameweek ON match_history(gameweek_id);
CREATE INDEX IF NOT EXISTS idx_match_history_teams ON match_history(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_match_history_status ON match_history(status);
CREATE INDEX IF NOT EXISTS idx_gameweeks_number ON gameweeks(number);
CREATE INDEX IF NOT EXISTS idx_gameweeks_dates ON gameweeks(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_team_gameweek_stats_team ON team_gameweek_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_team_gameweek_stats_gameweek ON team_gameweek_stats(gameweek_id);

-- Add RLS policies
ALTER TABLE public.gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_gameweek_stats ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to gameweeks"
  ON public.gameweeks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to match_history"
  ON public.match_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to team_gameweek_stats"
  ON public.team_gameweek_stats FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage gameweeks and matches
CREATE POLICY "Allow admin to manage gameweeks"
  ON public.gameweeks FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Allow admin to manage match_history"
  ON public.match_history FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin')); 