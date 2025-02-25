-- Add some test players
INSERT INTO players (
    name,
    position,
    team,
    league,
    current_price,
    base_price,
    is_available,
    minutes_played,
    goals_scored,
    assists,
    clean_sheets,
    form_rating,
    ownership_percent
) VALUES 
    ('Victor Osimhen', 'Forward', 'Napoli', 'EPL', 150000000, 140000000, true, 1200, 15, 3, 0, 8.5, 25.5),
    ('Samuel Chukwueze', 'Midfielder', 'AC Milan', 'EPL', 80000000, 75000000, true, 1500, 5, 8, 4, 7.8, 15.2),
    ('Wilfred Ndidi', 'Midfielder', 'Leicester City', 'EPL', 95000000, 90000000, true, 1800, 2, 4, 8, 7.2, 18.5),
    ('Calvin Bassey', 'Defender', 'Fulham', 'EPL', 70000000, 65000000, true, 1600, 0, 2, 6, 7.0, 12.8),
    ('Francis Uzoho', 'Goalkeeper', 'Omonia', 'NPFL', 45000000, 40000000, true, 1700, 0, 0, 7, 6.8, 8.5);

-- Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view available players
CREATE POLICY "Allow users to view available players"
    ON players FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to update players
CREATE POLICY "Allow authenticated users to update players"
    ON players FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated'); 