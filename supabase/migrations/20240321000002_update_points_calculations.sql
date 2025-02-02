-- Add new fields to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS points_per_game DECIMAL(4,1) DEFAULT 0.0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS selected_by_percent DECIMAL(4,1) DEFAULT 0.0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS chance_of_playing_next_round INTEGER DEFAULT 100;
ALTER TABLE players ADD COLUMN IF NOT EXISTS chance_of_playing_this_round INTEGER DEFAULT 100;
ALTER TABLE players ADD COLUMN IF NOT EXISTS value_form DECIMAL(4,1) DEFAULT 0.0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS value_season DECIMAL(4,1) DEFAULT 0.0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS transfers_in INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS transfers_out INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS transfers_in_gameweek INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS transfers_out_gameweek INTEGER DEFAULT 0;

-- Add new fields to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS transfers_remaining INTEGER DEFAULT 1;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS chips_used TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE teams ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create function to calculate points per game
CREATE OR REPLACE FUNCTION calculate_points_per_game()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players
  SET points_per_game = (
    SELECT COALESCE(AVG(points), 0)
    FROM player_gameweeks
    WHERE player_id = NEW.player_id
  )
  WHERE id = NEW.player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for points per game calculation
CREATE TRIGGER update_points_per_game_trigger
AFTER INSERT OR UPDATE ON player_gameweeks
FOR EACH ROW
EXECUTE FUNCTION calculate_points_per_game();

-- Create function to calculate value metrics
CREATE OR REPLACE FUNCTION calculate_value_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate value form (points per million over last 5 gameweeks)
  UPDATE players
  SET value_form = (
    SELECT COALESCE(SUM(points), 0) / NULLIF(current_price, 0)
    FROM (
      SELECT points
      FROM player_gameweeks
      WHERE player_id = NEW.player_id
      ORDER BY gameweek DESC
      LIMIT 5
    ) recent_games
  )
  WHERE id = NEW.player_id;
  
  -- Calculate value season (total points per million)
  UPDATE players
  SET value_season = (
    SELECT COALESCE(SUM(points), 0) / NULLIF(current_price, 0)
    FROM player_gameweeks
    WHERE player_id = NEW.player_id
  )
  WHERE id = NEW.player_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for value metrics calculation
CREATE TRIGGER update_value_metrics_trigger
AFTER INSERT OR UPDATE ON player_gameweeks
FOR EACH ROW
EXECUTE FUNCTION calculate_value_metrics();

-- Create function to update player popularity
CREATE OR REPLACE FUNCTION update_player_popularity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players
  SET selected_by_percent = (
    SELECT 
      COALESCE(
        COUNT(DISTINCT team_players.team_id)::DECIMAL / 
        NULLIF((SELECT COUNT(*) FROM teams), 0) * 100,
        0
      )
    FROM team_players
    WHERE team_players.player_id = NEW.player_id
  )
  WHERE id = NEW.player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for player popularity updates
CREATE TRIGGER update_player_popularity_trigger
AFTER INSERT OR UPDATE OR DELETE ON team_players
FOR EACH ROW
EXECUTE FUNCTION update_player_popularity();

-- Create function to track transfers
CREATE OR REPLACE FUNCTION track_player_transfers()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Player added to a team
    UPDATE players
    SET 
      transfers_in = transfers_in + 1,
      transfers_in_gameweek = transfers_in_gameweek + 1
    WHERE id = NEW.player_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Player removed from a team
    UPDATE players
    SET 
      transfers_out = transfers_out + 1,
      transfers_out_gameweek = transfers_out_gameweek + 1
    WHERE id = OLD.player_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transfer tracking
CREATE TRIGGER track_player_transfers_trigger
AFTER INSERT OR DELETE ON team_players
FOR EACH ROW
EXECUTE FUNCTION track_player_transfers();

-- Create function to reset gameweek transfer counts
CREATE OR REPLACE FUNCTION reset_gameweek_transfers()
RETURNS void AS $$
BEGIN
  UPDATE players
  SET 
    transfers_in_gameweek = 0,
    transfers_out_gameweek = 0;
    
  UPDATE teams
  SET transfers_remaining = 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate team ranks
CREATE OR REPLACE FUNCTION calculate_team_ranks()
RETURNS void AS $$
BEGIN
  -- Update overall rank
  UPDATE teams t
  SET overall_rank = ranks.rank
  FROM (
    SELECT id, RANK() OVER (ORDER BY total_points DESC) as rank
    FROM teams
  ) ranks
  WHERE t.id = ranks.id;
  
  -- Update gameweek rank
  UPDATE teams t
  SET gameweek_rank = ranks.rank
  FROM (
    SELECT id, RANK() OVER (ORDER BY gameweek_points DESC) as rank
    FROM teams
  ) ranks
  WHERE t.id = ranks.id;
END;
$$ LANGUAGE plpgsql; 