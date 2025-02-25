-- Clean up Team Management Section
-- First, backup existing team relationships
CREATE TABLE team_players_backup AS
SELECT * FROM team_players;

-- Update teams table structure
ALTER TABLE teams
    ALTER COLUMN budget SET DEFAULT 200000000,
    ALTER COLUMN token_balance SET DEFAULT 0,
    ALTER COLUMN total_value SET DEFAULT 0,
    ALTER COLUMN performance_score SET DEFAULT 0,
    ADD COLUMN IF NOT EXISTS formation TEXT CHECK (formation IN ('4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1')),
    ADD COLUMN IF NOT EXISTS playing_style TEXT CHECK (playing_style IN ('Attacking', 'Defensive', 'Possession', 'Counter-Attack')),
    ADD COLUMN IF NOT EXISTS mentality TEXT CHECK (mentality IN ('Balanced', 'Aggressive', 'Conservative'));

-- Update team_players table structure
ALTER TABLE team_players
    ADD COLUMN IF NOT EXISTS is_captain BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_vice_captain BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS sale_price BIGINT,
    ADD COLUMN IF NOT EXISTS purchase_price BIGINT;

-- Create or update team management functions
CREATE OR REPLACE FUNCTION buy_player(
    p_team_id UUID,
    p_player_id UUID,
    p_price BIGINT
) RETURNS jsonb AS $$
DECLARE
    v_team_budget BIGINT;
    v_new_budget BIGINT;
    v_player_data jsonb;
    v_squad_count INTEGER;
    v_user_id UUID;
BEGIN
    -- Get the current user's ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Authentication required'
        );
    END IF;

    -- Start transaction
    BEGIN
        -- Lock the player and team rows for update
        SELECT budget INTO v_team_budget
        FROM teams
        WHERE id = p_team_id AND user_id = v_user_id
        FOR UPDATE;

        IF v_team_budget IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Team not found or unauthorized'
            );
        END IF;

        -- Check if player is already unavailable
        IF EXISTS (
            SELECT 1 FROM players
            WHERE id = p_player_id AND NOT is_available
            FOR UPDATE
        ) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Player is no longer available'
            );
        END IF;

        -- Check squad size limit
        SELECT COUNT(*) INTO v_squad_count
        FROM team_players
        WHERE team_id = p_team_id;

        IF v_squad_count >= 25 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Squad size limit reached (max: 25 players)'
            );
        END IF;

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

        IF v_team_budget < p_price THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient budget'
            );
        END IF;

        -- Get player data and mark as unavailable
        UPDATE players 
        SET is_available = false,
            updated_at = NOW()
        WHERE id = p_player_id
        RETURNING jsonb_build_object(
            'id', id,
            'name', name,
            'position', position,
            'team', team,
            'current_price', current_price
        ) INTO v_player_data;

        IF v_player_data IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Player not found'
            );
        END IF;

        -- Update team budget
        UPDATE teams
        SET budget = budget - p_price,
            updated_at = NOW()
        WHERE id = p_team_id
        RETURNING budget INTO v_new_budget;

        -- Add player to team
        INSERT INTO team_players (
            team_id,
            player_id,
            purchase_price,
            is_captain,
            is_vice_captain,
            is_for_sale,
            created_at,
            updated_at
        ) VALUES (
            p_team_id,
            p_player_id,
            p_price,
            false,
            false,
            false,
            NOW(),
            NOW()
        );

        -- Update team's total value
        UPDATE teams
        SET total_value = (
            SELECT COALESCE(SUM(players.current_price), 0)
            FROM team_players
            JOIN players ON team_players.player_id = players.id
            WHERE team_players.team_id = p_team_id
        )
        WHERE id = p_team_id;

        -- Commit transaction
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Player purchased successfully',
            'new_budget', v_new_budget,
            'player', v_player_data
        );
    EXCEPTION
        WHEN OTHERS THEN
        -- Rollback transaction
        RAISE NOTICE 'Error in buy_player: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update team limit check trigger
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

-- Ensure trigger exists
DROP TRIGGER IF EXISTS check_team_limit_trigger ON teams;
CREATE TRIGGER check_team_limit_trigger
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION check_team_limit();

-- Update RLS policies for team management
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own teams" ON teams;
DROP POLICY IF EXISTS "Users can insert their own teams" ON teams;
DROP POLICY IF EXISTS "Users can update their own teams" ON teams;
DROP POLICY IF EXISTS "Users can delete their own teams" ON teams;
DROP POLICY IF EXISTS "Users can view their team players" ON team_players;
DROP POLICY IF EXISTS "Users can manage their team players" ON team_players;
DROP POLICY IF EXISTS "Users can view available players" ON players;

-- Create new policies
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

CREATE POLICY "Users can view their team players"
    ON team_players FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_players.team_id
        AND teams.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert team players"
    ON team_players FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_players.team_id
        AND teams.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their team players"
    ON team_players FOR UPDATE
    USING (EXISTS (
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

CREATE POLICY "Users can view available players"
    ON players FOR SELECT
    USING (true);

-- Restore team relationships from backup
INSERT INTO team_players (
    SELECT * FROM team_players_backup
    WHERE NOT EXISTS (
        SELECT 1 FROM team_players
        WHERE team_players.team_id = team_players_backup.team_id
        AND team_players.player_id = team_players_backup.player_id
    )
);

-- Clean up backup table
DROP TABLE team_players_backup;

-- Add helpful comments
COMMENT ON TABLE teams IS 'Teams table with proper RLS policies and team limit enforcement';
COMMENT ON TABLE team_players IS 'Team players junction table with proper relationships and RLS policies';
COMMENT ON FUNCTION buy_player IS 'Function to handle player purchases with budget checks';
COMMENT ON FUNCTION check_team_limit IS 'Ensures users cannot create more than 5 teams'; 