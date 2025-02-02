-- Create match_history table
CREATE TABLE IF NOT EXISTS public.match_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gameweek_id UUID REFERENCES public.gameweeks(id),
    home_team_id UUID REFERENCES public.teams(id),
    away_team_id UUID REFERENCES public.teams(id),
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed')),
    match_events JSONB,
    player_performances JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gameweeks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gameweeks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'in_progress', 'completed')),
    season_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_gameweek_stats table
CREATE TABLE IF NOT EXISTS public.player_gameweek_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.players(id),
    gameweek_id UUID REFERENCES public.gameweeks(id),
    match_id UUID REFERENCES public.match_history(id),
    minutes_played INTEGER DEFAULT 0,
    goals_scored INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    goals_conceded INTEGER DEFAULT 0,
    own_goals INTEGER DEFAULT 0,
    penalties_saved INTEGER DEFAULT 0,
    penalties_missed INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    bonus_points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, gameweek_id, match_id)
);

-- Create team_gameweek_stats table
CREATE TABLE IF NOT EXISTS public.team_gameweek_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id),
    gameweek_id UUID REFERENCES public.gameweeks(id),
    total_points INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, gameweek_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_match_history_gameweek ON match_history(gameweek_id);
CREATE INDEX IF NOT EXISTS idx_match_history_teams ON match_history(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_match_history_status ON match_history(status);
CREATE INDEX IF NOT EXISTS idx_gameweeks_number ON gameweeks(number);
CREATE INDEX IF NOT EXISTS idx_gameweeks_dates ON gameweeks(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_player_gameweek_stats_player ON player_gameweek_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_gameweek_stats_gameweek ON player_gameweek_stats(gameweek_id);
CREATE INDEX IF NOT EXISTS idx_team_gameweek_stats_team ON team_gameweek_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_team_gameweek_stats_gameweek ON team_gameweek_stats(gameweek_id);

-- Create function to calculate player points
CREATE OR REPLACE FUNCTION calculate_player_points()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_points := (
        NEW.goals_scored * 4 +
        NEW.assists * 3 +
        NEW.clean_sheets * 4 +
        NEW.penalties_saved * 5 -
        NEW.goals_conceded -
        NEW.own_goals * 2 -
        NEW.penalties_missed * 2 -
        NEW.yellow_cards -
        NEW.red_cards * 3 +
        NEW.bonus_points +
        CASE 
            WHEN NEW.minutes_played >= 60 THEN 2
            WHEN NEW.minutes_played > 0 THEN 1
            ELSE 0
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calculating points
CREATE TRIGGER calculate_player_points_trigger
BEFORE INSERT OR UPDATE ON player_gameweek_stats
FOR EACH ROW
EXECUTE FUNCTION calculate_player_points();

-- Create function to update team stats
CREATE OR REPLACE FUNCTION update_team_gameweek_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update team stats based on match result
    WITH match_stats AS (
        SELECT 
            CASE 
                WHEN home_score > away_score THEN home_team_id
                WHEN away_score > home_score THEN away_team_id
                ELSE NULL
            END as winner_id,
            CASE 
                WHEN home_score = away_score THEN true
                ELSE false
            END as is_draw,
            home_team_id,
            away_team_id,
            home_score,
            away_score,
            CASE 
                WHEN home_score = 0 THEN away_team_id
                WHEN away_score = 0 THEN home_team_id
                ELSE NULL
            END as clean_sheet_team_id
        FROM match_history
        WHERE id = NEW.id
    )
    UPDATE team_gameweek_stats tgs
    SET 
        matches_played = matches_played + 1,
        wins = wins + CASE WHEN ms.winner_id = tgs.team_id THEN 1 ELSE 0 END,
        draws = draws + CASE WHEN ms.is_draw THEN 1 ELSE 0 END,
        losses = losses + CASE 
            WHEN NOT ms.is_draw AND ms.winner_id IS NOT NULL 
            AND ms.winner_id != tgs.team_id THEN 1 
            ELSE 0 
        END,
        goals_for = goals_for + CASE 
            WHEN tgs.team_id = ms.home_team_id THEN ms.home_score
            ELSE ms.away_score
        END,
        goals_against = goals_against + CASE 
            WHEN tgs.team_id = ms.home_team_id THEN ms.away_score
            ELSE ms.home_score
        END,
        clean_sheets = clean_sheets + CASE 
            WHEN ms.clean_sheet_team_id = tgs.team_id THEN 1
            ELSE 0
        END
    FROM match_stats ms
    WHERE tgs.team_id IN (ms.home_team_id, ms.away_team_id)
    AND tgs.gameweek_id = NEW.gameweek_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating team stats
CREATE TRIGGER update_team_stats_trigger
AFTER INSERT OR UPDATE ON match_history
FOR EACH ROW
EXECUTE FUNCTION update_team_gameweek_stats(); 