-- Add captain columns to team_players table
ALTER TABLE team_players 
ADD COLUMN IF NOT EXISTS is_captain BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_vice_captain BOOLEAN DEFAULT false;

-- Add constraint to ensure only one captain per team
ALTER TABLE team_players
ADD CONSTRAINT unique_team_captain 
UNIQUE (team_id, is_captain)
WHERE is_captain = true;

-- Add constraint to ensure only one vice captain per team
ALTER TABLE team_players
ADD CONSTRAINT unique_team_vice_captain 
UNIQUE (team_id, is_vice_captain)
WHERE is_vice_captain = true; 