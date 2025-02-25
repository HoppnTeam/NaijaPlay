-- Initial Fantasy Football Database Setup

-- Step 1: Create base tables
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    budget BIGINT NOT NULL DEFAULT 200000000,
    token_balance INTEGER DEFAULT 0,
    total_value INTEGER DEFAULT 0,
    performance_score INTEGER DEFAULT 0,
    formation TEXT CHECK (formation IN ('4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1')),
    playing_style TEXT CHECK (playing_style IN ('Attacking', 'Defensive', 'Possession', 'Counter-Attack')),
    mentality TEXT CHECK (mentality IN ('Balanced', 'Aggressive', 'Conservative')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    team TEXT NOT NULL,
    league TEXT NOT NULL,
    current_price BIGINT NOT NULL,
    base_price BIGINT NOT NULL,
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
    bonus INTEGER DEFAULT 0,
    form_rating DECIMAL(3,1) DEFAULT 0.0,
    ownership_percent DECIMAL(5,2) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    purchase_price BIGINT NOT NULL,
    is_captain BOOLEAN DEFAULT false,
    is_vice_captain BOOLEAN DEFAULT false,
    is_for_sale BOOLEAN DEFAULT false,
    sale_price BIGINT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    UNIQUE(team_id, player_id)
);

-- Step 2: Create indexes for better performance
CREATE INDEX idx_teams_user_id ON teams(user_id);
CREATE INDEX idx_players_price ON players(current_price);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_league ON players(league);
CREATE INDEX idx_players_availability ON players(is_available);
CREATE INDEX idx_team_players_team_id ON team_players(team_id);
CREATE INDEX idx_team_players_player_id ON team_players(player_id);

-- Step 3: Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
-- Teams policies
CREATE POLICY "Users can view their own teams"
    ON teams FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own teams"
    ON teams FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        (SELECT COUNT(*) FROM teams WHERE user_id = auth.uid()) < 5
    );

CREATE POLICY "Users can update their own teams"
    ON teams FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams"
    ON teams FOR DELETE
    USING (auth.uid() = user_id);

-- Players policies
CREATE POLICY "Players are viewable by all users"
    ON players FOR SELECT
    USING (true);

-- Team players policies
CREATE POLICY "Users can view their team players"
    ON team_players FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_players.team_id
        AND teams.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their team players"
    ON team_players FOR ALL
    USING (EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_players.team_id
        AND teams.user_id = auth.uid()
    ));

-- Step 5: Create functions and triggers
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teams_timestamp
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_timestamp
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_players_timestamp
    BEFORE UPDATE ON team_players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Team limit check
CREATE OR REPLACE FUNCTION check_team_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM teams
        WHERE user_id = NEW.user_id
    ) >= 5 THEN
        RAISE EXCEPTION 'User cannot create more than 5 teams';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_team_limit_trigger
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION check_team_limit();

-- Buy player function
CREATE OR REPLACE FUNCTION buy_player(
    p_team_id UUID,
    p_player_id UUID,
    p_price BIGINT
) RETURNS jsonb AS $$
DECLARE
    v_team_budget BIGINT;
    v_player_available BOOLEAN;
BEGIN
    -- Check if player is already in a team
    IF EXISTS (
        SELECT 1 FROM team_players
        WHERE player_id = p_player_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Player is already in a team'
        );
    END IF;

    -- Check team budget
    SELECT budget INTO v_team_budget
    FROM teams
    WHERE id = p_team_id;

    IF v_team_budget < p_price THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient budget'
        );
    END IF;

    -- Perform transaction
    BEGIN
        -- Update team budget
        UPDATE teams
        SET budget = budget - p_price
        WHERE id = p_team_id;

        -- Add player to team
        INSERT INTO team_players (
            team_id,
            player_id,
            purchase_price
        ) VALUES (
            p_team_id,
            p_player_id,
            p_price
        );

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Player purchased successfully'
        );
    EXCEPTION
        WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Seed initial players
INSERT INTO players (
    name, position, team, league, current_price, base_price, 
    minutes_played, goals_scored, assists, clean_sheets, form_rating, ownership_percent,
    is_available
) VALUES
    -- Premium EPL Stars (60M-150M)
    ('Erling Haaland', 'Forward', 'Manchester City', 'EPL', 150000000, 150000000, 2160, 28, 5, 0, 8.9, 45.2, true),
    ('Mohamed Salah', 'Forward', 'Liverpool', 'EPL', 130000000, 130000000, 2070, 18, 12, 0, 8.7, 42.1, true),
    ('Kevin De Bruyne', 'Midfielder', 'Manchester City', 'EPL', 120000000, 120000000, 1890, 8, 16, 0, 8.8, 38.5, true),
    ('Bruno Fernandes', 'Midfielder', 'Manchester United', 'EPL', 100000000, 100000000, 2250, 12, 14, 0, 8.5, 35.8, true),
    ('Bukayo Saka', 'Forward', 'Arsenal', 'EPL', 90000000, 90000000, 2160, 15, 11, 0, 8.6, 40.2, true),
    ('Phil Foden', 'Midfielder', 'Manchester City', 'EPL', 85000000, 85000000, 1980, 11, 8, 0, 8.4, 32.5, true),
    ('Virgil van Dijk', 'Defender', 'Liverpool', 'EPL', 80000000, 80000000, 2070, 2, 0, 12, 8.3, 28.9, true),
    ('Rodri', 'Midfielder', 'Manchester City', 'EPL', 75000000, 75000000, 2160, 6, 5, 0, 8.2, 25.4, true),
    ('Alisson', 'Goalkeeper', 'Liverpool', 'EPL', 70000000, 70000000, 2250, 0, 0, 14, 8.1, 30.2, true),
    ('Declan Rice', 'Midfielder', 'Arsenal', 'EPL', 65000000, 65000000, 2250, 4, 6, 0, 8.0, 22.8, true),

    -- Premium NPFL Stars (20M-100M)
    ('Sadiq Umar', 'Forward', 'Enyimba', 'NPFL', 100000000, 100000000, 1980, 22, 8, 0, 8.5, 35.2, true),
    ('Chisom Chikatara', 'Forward', 'Rivers United', 'NPFL', 85000000, 85000000, 1890, 18, 6, 0, 8.3, 32.1, true),
    ('Stanley Nwabili', 'Goalkeeper', 'Lobi Stars', 'NPFL', 70000000, 70000000, 2160, 0, 0, 15, 8.2, 28.5, true),
    ('Sikiru Alimi', 'Forward', 'Remo Stars', 'NPFL', 60000000, 60000000, 2070, 16, 5, 0, 8.1, 25.8, true),
    ('Mfon Udoh', 'Forward', 'Akwa United', 'NPFL', 50000000, 50000000, 1980, 14, 4, 0, 8.0, 22.4, true),

    -- Budget Players (Under 10M)
    ('James Beadle', 'Goalkeeper', 'Sheffield United', 'EPL', 8000000, 8000000, 720, 0, 0, 2, 6.5, 1.8, true),
    ('Ben Johnson', 'Defender', 'West Ham', 'EPL', 7500000, 7500000, 810, 0, 1, 2, 6.4, 1.5, true),
    ('Lewis Dobbin', 'Forward', 'Everton', 'EPL', 6000000, 6000000, 450, 1, 0, 0, 6.3, 1.2, true),
    ('Divine Nwachukwu', 'Forward', 'Rivers United', 'NPFL', 9000000, 9000000, 900, 3, 1, 0, 6.6, 2.5, true),
    ('Samuel Amadi', 'Midfielder', 'Enyimba', 'NPFL', 8500000, 8500000, 810, 2, 2, 0, 6.5, 2.2, true),
    ('Ibrahim Said', 'Forward', 'Remo Stars', 'NPFL', 7000000, 7000000, 720, 2, 1, 0, 6.4, 1.8, true);

-- Add comment
COMMENT ON TABLE teams IS 'Teams table with proper RLS policies and team limit enforcement';
COMMENT ON TABLE players IS 'Players table with complete player list and proper RLS policies';
COMMENT ON TABLE team_players IS 'Team players junction table with proper relationships and RLS policies'; 