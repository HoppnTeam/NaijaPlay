-- First drop triggers
DROP TRIGGER IF EXISTS check_team_limit_trigger ON teams;
DROP TRIGGER IF EXISTS enforce_team_limit ON teams;

-- Then drop functions
DROP FUNCTION IF EXISTS buy_player;
DROP FUNCTION IF EXISTS check_team_limit;

-- Drop existing tables (in correct order to handle foreign key constraints)
DROP TABLE IF EXISTS team_players CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate base tables
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    budget BIGINT DEFAULT 200000000,
    token_balance BIGINT DEFAULT 0,
    total_value BIGINT DEFAULT 0,
    performance_score INTEGER DEFAULT 0,
    formation TEXT CHECK (formation IN ('4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1')),
    playing_style TEXT CHECK (playing_style IN ('Attacking', 'Defensive', 'Possession', 'Counter-Attack')),
    mentality TEXT CHECK (mentality IN ('Balanced', 'Aggressive', 'Conservative')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('Goalkeeper', 'Defender', 'Midfielder', 'Forward')),
    team TEXT NOT NULL,
    league TEXT NOT NULL,
    current_price BIGINT NOT NULL,
    base_price BIGINT NOT NULL,
    is_available BOOLEAN DEFAULT true,
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
    form_rating DECIMAL DEFAULT 0,
    ownership_percent DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    purchase_price BIGINT NOT NULL,
    is_captain BOOLEAN DEFAULT false,
    is_vice_captain BOOLEAN DEFAULT false,
    is_for_sale BOOLEAN DEFAULT false,
    sale_price BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id)
);

-- Create team limit check trigger
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

-- Create buy_player function
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
    v_team_player_id UUID;
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
        -- Lock the team row for update
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

        -- Check budget
        IF v_team_budget < p_price THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient budget'
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

        -- Lock and check player availability
        UPDATE players 
        SET is_available = false,
            updated_at = NOW()
        WHERE id = p_player_id AND is_available = true
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
                'error', 'Player is no longer available'
            );
        END IF;

        -- Check squad size limit
        SELECT COUNT(*) INTO v_squad_count
        FROM team_players
        WHERE team_id = p_team_id;

        IF v_squad_count >= 25 THEN
            -- Rollback player availability
            UPDATE players SET is_available = true WHERE id = p_player_id;
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Squad size limit reached (max: 25 players)'
            );
        END IF;

        -- Update team budget
        UPDATE teams
        SET 
            budget = budget - p_price,
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
        )
        RETURNING id INTO v_team_player_id;

        -- Update team's total value
        UPDATE teams
        SET total_value = (
            SELECT COALESCE(SUM(players.current_price), 0)
            FROM team_players
            JOIN players ON team_players.player_id = players.id
            WHERE team_players.team_id = p_team_id
        )
        WHERE id = p_team_id;

        -- Return success response
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Player purchased successfully',
            'new_budget', v_new_budget,
            'player', v_player_data,
            'team_player_id', v_team_player_id
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback player availability in case of error
            UPDATE players SET is_available = true WHERE id = p_player_id;
            RAISE NOTICE 'Error in buy_player: %', SQLERRM;
            RETURN jsonb_build_object(
                'success', false,
                'error', SQLERRM
            );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 