-- Ensure the players table exists and is empty
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  team TEXT NOT NULL,
  current_price BIGINT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Clear existing data
TRUNCATE TABLE players CASCADE;

-- Insert seed data
INSERT INTO players (name, position, team, current_price, is_available)
VALUES
  ('Victor Osimhen', 'Forward', 'Napoli', 150000000, true),
  ('Samuel Chukwueze', 'Forward', 'AC Milan', 80000000, true),
  ('Wilfred Ndidi', 'Midfielder', 'Leicester City', 70000000, true),
  ('Alex Iwobi', 'Midfielder', 'Fulham', 65000000, true),
  ('Calvin Bassey', 'Defender', 'Fulham', 55000000, true),
  ('Francis Uzoho', 'Goalkeeper', 'Omonia', 45000000, true),
  ('Maduka Okoye', 'Goalkeeper', 'Udinese', 40000000, true),
  ('Kenneth Omeruo', 'Defender', 'Kasimpasa', 35000000, true),
  ('Joe Aribo', 'Midfielder', 'Southampton', 60000000, true),
  ('Terem Moffi', 'Forward', 'Nice', 75000000, true),
  ('William Troost-Ekong', 'Defender', 'PAOK', 45000000, true),
  ('Kelechi Iheanacho', 'Forward', 'Leicester City', 70000000, true),
  ('Moses Simon', 'Forward', 'Nantes', 55000000, true),
  ('Ola Aina', 'Defender', 'Nottingham Forest', 50000000, true),
  ('Paul Onuachu', 'Forward', 'Southampton', 65000000, true);

-- Create an index for faster searches
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
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