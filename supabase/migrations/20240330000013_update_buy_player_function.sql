-- Drop existing function if it exists
DROP FUNCTION IF EXISTS buy_player;

-- Create or replace the buy_player function with better error handling
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

        -- Lock and check player availability
        UPDATE players 
        SET is_available = false
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
            id,
            team_id,
            player_id,
            purchase_price,
            is_captain,
            is_vice_captain,
            is_for_sale,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
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