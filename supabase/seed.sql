-- Ensure the players table exists and is empty
CREATE TABLE IF NOT EXISTS players (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Clear existing data
TRUNCATE TABLE players CASCADE;

-- Insert seed data for both EPL and EPFL players with adjusted pricing tiers
-- Tier 1 (Average): ₦5,000,000 - ₦10,000,000
-- Tier 2 (Quality): ₦10,000,000 - ₦20,000,000
-- Tier 3 (Superstar): ₦20,000,000 - ₦30,000,000
INSERT INTO players (
  name, position, team, league, current_price, base_price, 
  minutes_played, goals_scored, assists, clean_sheets, form_rating, ownership_percent
) VALUES
  -- EPL Players (Superstars: 30M)
  ('Erling Haaland', 'Forward', 'Manchester City', 'EPL', 30000000, 30000000, 360, 10, 2, 0, 9.0, 45.2),
  ('Mohamed Salah', 'Forward', 'Liverpool', 'EPL', 30000000, 30000000, 540, 8, 5, 0, 8.5, 35.4),
  ('Kevin De Bruyne', 'Midfielder', 'Manchester City', 'EPL', 30000000, 30000000, 420, 4, 8, 0, 8.7, 30.5),
  ('Harry Kane', 'Forward', 'Bayern Munich', 'EPL', 30000000, 30000000, 540, 9, 3, 0, 8.6, 32.8),
  ('Son Heung-min', 'Forward', 'Tottenham', 'EPL', 30000000, 30000000, 520, 7, 4, 0, 8.4, 28.5),
  ('Kylian Mbappe', 'Forward', 'Real Madrid', 'EPL', 30000000, 30000000, 540, 12, 6, 0, 9.5, 50.0),
  
  -- EPL Players (Quality: 20M)
  ('Bukayo Saka', 'Midfielder', 'Arsenal', 'EPL', 20000000, 20000000, 450, 6, 4, 0, 8.2, 15.5),
  ('Bruno Fernandes', 'Midfielder', 'Manchester United', 'EPL', 20000000, 20000000, 480, 3, 6, 0, 7.8, 25.8),
  ('Virgil van Dijk', 'Defender', 'Liverpool', 'EPL', 20000000, 20000000, 520, 1, 0, 6, 7.5, 18.5),
  ('Phil Foden', 'Midfielder', 'Manchester City', 'EPL', 20000000, 20000000, 450, 5, 4, 0, 8.3, 22.5),
  ('Trent Alexander-Arnold', 'Defender', 'Liverpool', 'EPL', 20000000, 20000000, 500, 1, 7, 5, 8.0, 20.2),
  ('Martin Odegaard', 'Midfielder', 'Arsenal', 'EPL', 20000000, 20000000, 480, 4, 6, 0, 8.1, 20.8),
  ('Rodri', 'Midfielder', 'Manchester City', 'EPL', 20000000, 20000000, 540, 2, 3, 0, 7.9, 15.5),
  ('William Saliba', 'Defender', 'Arsenal', 'EPL', 20000000, 20000000, 540, 0, 0, 7, 7.8, 16.2),
  
  -- EPL Goalkeepers (8M)
  ('Alisson', 'Goalkeeper', 'Liverpool', 'EPL', 8000000, 8000000, 540, 0, 0, 6, 7.8, 22.2),
  ('Ederson', 'Goalkeeper', 'Manchester City', 'EPL', 8000000, 8000000, 540, 0, 0, 7, 7.9, 18.5),
  ('David Raya', 'Goalkeeper', 'Arsenal', 'EPL', 8000000, 8000000, 540, 0, 0, 7, 7.7, 14.5),

  -- Nigerian Players in EPL and other European leagues (Superstars: 25M)
  ('Victor Osimhen', 'Forward', 'Napoli', 'EPFL', 25000000, 25000000, 450, 8, 2, 0, 8.5, 25.5),
  ('Ademola Lookman', 'Forward', 'Atalanta', 'EPFL', 25000000, 25000000, 420, 6, 4, 0, 8.0, 20.5),
  
  -- Nigerian Players in EPL and other European leagues (Quality: 15M)
  ('Samuel Chukwueze', 'Forward', 'AC Milan', 'EPFL', 15000000, 15000000, 360, 4, 3, 0, 7.2, 15.2),
  ('Wilfred Ndidi', 'Midfielder', 'Leicester City', 'EPFL', 15000000, 15000000, 540, 1, 4, 2, 7.8, 18.4),
  ('Alex Iwobi', 'Midfielder', 'Fulham', 'EPFL', 15000000, 15000000, 480, 2, 5, 1, 7.5, 12.8),
  ('Kelechi Iheanacho', 'Forward', 'Leicester City', 'EPFL', 15000000, 15000000, 380, 5, 2, 0, 7.4, 15.8),
  
  -- Nigerian Players in EPL and other European leagues (Average: 8M)
  ('Calvin Bassey', 'Defender', 'Fulham', 'EPFL', 8000000, 8000000, 520, 0, 1, 4, 7.1, 8.5),
  ('Joe Aribo', 'Midfielder', 'Southampton', 'EPFL', 8000000, 8000000, 450, 2, 3, 1, 7.0, 10.2),
  ('Ola Aina', 'Defender', 'Nottingham Forest', 'EPFL', 8000000, 8000000, 500, 1, 2, 3, 7.2, 8.0),
  
  -- EPFL Goalkeepers (6M)
  ('Francis Uzoho', 'Goalkeeper', 'Omonia', 'EPFL', 6000000, 6000000, 540, 0, 0, 3, 6.8, 5.2),
  ('Maduka Okoye', 'Goalkeeper', 'Udinese', 'EPFL', 6000000, 6000000, 450, 0, 0, 2, 6.5, 4.5),
  
  -- Nigerian Premier League (NPFL) Players (Quality: 10M)
  ('Sikiru Alimi', 'Forward', 'Remo Stars', 'NPFL', 10000000, 10000000, 540, 7, 3, 0, 7.8, 18.5),
  ('Chijioke Akuneto', 'Forward', 'Rivers United', 'NPFL', 10000000, 10000000, 520, 6, 2, 0, 7.5, 16.2),
  ('Rabiu Ali', 'Midfielder', 'Kano Pillars', 'NPFL', 10000000, 10000000, 540, 4, 5, 1, 7.6, 15.4),
  
  -- Nigerian Premier League (NPFL) Players (Average: 5M)
  ('Enyimba Ojo', 'Midfielder', 'Enyimba FC', 'NPFL', 5000000, 5000000, 500, 3, 4, 2, 7.3, 12.8),
  ('Tope Olusesi', 'Defender', 'Rangers International', 'NPFL', 5000000, 5000000, 540, 0, 1, 5, 7.0, 10.5),
  ('Mfon Udoh', 'Forward', 'Akwa United', 'NPFL', 5000000, 5000000, 480, 5, 2, 0, 7.4, 14.2),
  ('Ibrahim Sunusi', 'Forward', 'Nasarawa United', 'NPFL', 5000000, 5000000, 500, 4, 3, 0, 7.2, 13.5),
  ('Nwagua Nyima', 'Midfielder', 'Kano Pillars', 'NPFL', 5000000, 5000000, 520, 2, 4, 1, 7.0, 11.8),
  ('Ifeanyi Anaemena', 'Defender', 'Rivers United', 'NPFL', 5000000, 5000000, 540, 1, 0, 4, 6.8, 9.2),
  
  -- NPFL Goalkeepers (4M)
  ('Amas Obasogie', 'Goalkeeper', 'Bendel Insurance', 'NPFL', 4000000, 4000000, 540, 0, 0, 6, 7.2, 8.5),
  ('Theophilus Afelokhai', 'Goalkeeper', 'Enyimba FC', 'NPFL', 4000000, 4000000, 520, 0, 0, 5, 6.9, 7.5);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_league ON players(league);
CREATE INDEX IF NOT EXISTS idx_players_is_available ON players(is_available);

-- Enable row level security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy for reading players
CREATE POLICY "Players are viewable by all users"
  ON players FOR SELECT
  USING (true);

-- Create policy for updating players
CREATE POLICY "Players can only be updated by authenticated users"
  ON players FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Set up triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create a team with players
CREATE OR REPLACE FUNCTION create_team_with_players(user_id UUID)
RETURNS UUID AS $$
DECLARE
    new_team_id UUID;
BEGIN
    -- Create team
    INSERT INTO teams (name, budget, user_id)
    VALUES ('NaijaStars FC', 200000000, user_id)
    RETURNING id INTO new_team_id;

    -- Add players to team
    INSERT INTO team_players (team_id, player_id, is_captain, is_vice_captain, is_for_sale)
    VALUES 
      (new_team_id, (SELECT id FROM players WHERE name = 'Victor Osimhen' LIMIT 1), true, false, false),  -- Osimhen as captain
      (new_team_id, (SELECT id FROM players WHERE name = 'Samuel Chukwueze' LIMIT 1), false, true, false),  -- Chukwueze as vice
      (new_team_id, (SELECT id FROM players WHERE name = 'Wilfred Ndidi' LIMIT 1), false, false, false), -- Ndidi
      (new_team_id, (SELECT id FROM players WHERE name = 'Alex Iwobi' LIMIT 1), false, false, false), -- Iwobi
      (new_team_id, (SELECT id FROM players WHERE name = 'Calvin Bassey' LIMIT 1), false, false, false), -- Bassey
      (new_team_id, (SELECT id FROM players WHERE name = 'Francis Uzoho' LIMIT 1), false, false, false); -- Uzoho

    RETURN new_team_id;
END;
$$ LANGUAGE plpgsql; 