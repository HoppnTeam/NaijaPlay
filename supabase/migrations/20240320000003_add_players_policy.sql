-- Enable RLS on players table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to players
CREATE POLICY "Allow public read access to players"
    ON players FOR SELECT
    USING (true); 