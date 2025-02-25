-- Add timestamp columns to team_players table
ALTER TABLE team_players
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_team_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS team_players_updated_at ON team_players;
CREATE TRIGGER team_players_updated_at
  BEFORE UPDATE ON team_players
  FOR EACH ROW
  EXECUTE FUNCTION update_team_players_updated_at();

-- Update existing rows to have timestamps
UPDATE team_players 
SET 
  created_at = NOW(),
  updated_at = NOW()
WHERE created_at IS NULL; 