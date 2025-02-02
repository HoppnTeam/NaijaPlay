-- Create player_gameweeks table
CREATE TABLE IF NOT EXISTS player_gameweeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  gameweek INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
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
  form DECIMAL(3,1) DEFAULT 0.0,
  price_change DECIMAL(4,1) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(player_id, gameweek)
);

-- Create team_gameweeks table
CREATE TABLE IF NOT EXISTS team_gameweeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  gameweek INTEGER NOT NULL,
  total_points INTEGER DEFAULT 0,
  points_on_bench INTEGER DEFAULT 0,
  transfers_made INTEGER DEFAULT 0,
  transfers_cost INTEGER DEFAULT 0,
  captain_points INTEGER DEFAULT 0,
  vice_captain_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, gameweek)
);

-- Add new columns to teams table for points tracking
ALTER TABLE teams ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS gameweek_points INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS overall_rank INTEGER;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS gameweek_rank INTEGER;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_id UUID REFERENCES players(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS vice_captain_id UUID REFERENCES players(id);

-- Enable RLS
ALTER TABLE player_gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_gameweeks ENABLE ROW LEVEL SECURITY;

-- Policies for player_gameweeks
CREATE POLICY "Player gameweeks are viewable by everyone"
  ON player_gameweeks
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert player gameweeks"
  ON player_gameweeks
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@naijaplay.com'
    )
  );

CREATE POLICY "Only admins can update player gameweeks"
  ON player_gameweeks
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@naijaplay.com'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@naijaplay.com'
    )
  );

-- Policies for team_gameweeks
CREATE POLICY "Team gameweeks are viewable by everyone"
  ON team_gameweeks
  FOR SELECT
  USING (true);

CREATE POLICY "Team owners can insert their gameweeks"
  ON team_gameweeks
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can update their gameweeks"
  ON team_gameweeks
  FOR UPDATE
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams
      WHERE user_id = auth.uid()
    )
  );

-- Create function to update player form
CREATE OR REPLACE FUNCTION update_player_form()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players
  SET form = (
    SELECT COALESCE(AVG(points), 0)
    FROM (
      SELECT points
      FROM player_gameweeks
      WHERE player_id = NEW.player_id
      ORDER BY gameweek DESC
      LIMIT 5
    ) recent_games
  )
  WHERE id = NEW.player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update form after gameweek insert/update
CREATE TRIGGER update_player_form_trigger
AFTER INSERT OR UPDATE ON player_gameweeks
FOR EACH ROW
EXECUTE FUNCTION update_player_form();

-- Create function to update team points
CREATE OR REPLACE FUNCTION update_team_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE teams
  SET 
    gameweek_points = NEW.total_points,
    total_points = (
      SELECT COALESCE(SUM(total_points), 0)
      FROM team_gameweeks
      WHERE team_id = NEW.team_id
    )
  WHERE id = NEW.team_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update team points after gameweek insert/update
CREATE TRIGGER update_team_points_trigger
AFTER INSERT OR UPDATE ON team_gameweeks
FOR EACH ROW
EXECUTE FUNCTION update_team_points(); 