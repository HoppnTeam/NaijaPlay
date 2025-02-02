-- First, ensure RLS is enabled
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public read access to players" ON players;

-- Create a new policy that allows anyone to read players, even if not authenticated
CREATE POLICY "Allow anyone to read players"
ON players
FOR SELECT
TO public
USING (true);

-- Grant usage on the schema to the anon role
GRANT USAGE ON SCHEMA public TO anon;

-- Grant SELECT on players table to the anon role
GRANT SELECT ON players TO anon;

-- Create leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('NPFL', 'EPL')),
    max_teams INTEGER NOT NULL,
    entry_fee INTEGER NOT NULL,
    total_prize INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create league_members table
CREATE TABLE IF NOT EXISTS public.league_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    rank INTEGER,
    gameweek_points INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(league_id, user_id)
);

-- Enable RLS on leagues table
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to leagues
CREATE POLICY "Allow anyone to read leagues"
ON leagues
FOR SELECT
TO public
USING (true);

-- Grant SELECT on leagues table to the anon role
GRANT SELECT ON leagues TO anon; 