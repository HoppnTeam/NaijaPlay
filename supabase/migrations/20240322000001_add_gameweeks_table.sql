-- Create gameweeks table
CREATE TABLE IF NOT EXISTS public.gameweeks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(number)
);

-- Enable RLS
ALTER TABLE gameweeks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Gameweeks are viewable by everyone"
    ON gameweeks FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert gameweeks"
    ON gameweeks FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Only admins can update gameweeks"
    ON gameweeks FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add some initial gameweeks
INSERT INTO gameweeks (number, start_date, end_date, status)
VALUES 
    (1, '2024-03-25 00:00:00+00', '2024-03-31 23:59:59+00', 'upcoming'),
    (2, '2024-04-01 00:00:00+00', '2024-04-07 23:59:59+00', 'upcoming'),
    (3, '2024-04-08 00:00:00+00', '2024-04-14 23:59:59+00', 'upcoming'),
    (4, '2024-04-15 00:00:00+00', '2024-04-21 23:59:59+00', 'upcoming'),
    (5, '2024-04-22 00:00:00+00', '2024-04-28 23:59:59+00', 'upcoming')
ON CONFLICT (number) DO NOTHING; 