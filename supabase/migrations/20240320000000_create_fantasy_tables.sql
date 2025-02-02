-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('Goalkeeper', 'Defender', 'Midfielder', 'Forward')),
    team TEXT NOT NULL,
    current_price INTEGER NOT NULL CHECK (current_price > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    budget INTEGER NOT NULL DEFAULT 100000000 CHECK (budget >= 0),
    total_value INTEGER NOT NULL DEFAULT 0 CHECK (total_value >= 0),
    formation TEXT NOT NULL DEFAULT '4-3-3',
    playing_style TEXT NOT NULL DEFAULT 'Possession',
    mentality TEXT NOT NULL DEFAULT 'Balanced',
    captain_id UUID REFERENCES players(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name, user_id)
);

-- Add constraints for formation, playing_style, and mentality
ALTER TABLE teams ADD CONSTRAINT valid_formation CHECK (formation IN ('4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1'));
ALTER TABLE teams ADD CONSTRAINT valid_playing_style CHECK (playing_style IN ('Attacking', 'Defensive', 'Possession', 'Counter-Attack'));
ALTER TABLE teams ADD CONSTRAINT valid_mentality CHECK (mentality IN ('Balanced', 'Aggressive', 'Conservative'));

-- Create team_players table
CREATE TABLE IF NOT EXISTS team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    purchase_price INTEGER NOT NULL CHECK (purchase_price > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, player_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view their own teams"
    ON teams FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own teams"
    ON teams FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams"
    ON teams FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams"
    ON teams FOR DELETE
    USING (auth.uid() = user_id);

-- Team players policies
CREATE POLICY "Users can view their team players"
    ON team_players FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_players.team_id
        AND teams.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their team players"
    ON team_players FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_players.team_id
        AND teams.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their team players"
    ON team_players FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_players.team_id
        AND teams.user_id = auth.uid()
    ));
