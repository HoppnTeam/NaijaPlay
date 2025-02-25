-- Adjust player prices to ensure teams can afford a complete squad of 15 players
-- with their initial budget of ₦200,000,000

-- Create three tiers of players:
-- 1. Average Players: ₦5,000,000 - ₦10,000,000
-- 2. Quality Players: ₦10,000,000 - ₦20,000,000
-- 3. Superstar Players: ₦20,000,000 - ₦30,000,000

-- Update EPL Players (Superstars and Quality)
UPDATE players
SET current_price = 
  CASE 
    -- Superstars
    WHEN name IN ('Erling Haaland', 'Mohamed Salah', 'Kevin De Bruyne', 'Harry Kane', 'Son Heung-min', 'Kylian Mbappe')
    THEN 30000000
    -- Quality players
    WHEN name IN ('Bukayo Saka', 'Bruno Fernandes', 'Virgil van Dijk', 'Phil Foden', 'Trent Alexander-Arnold', 'Martin Odegaard', 'Rodri', 'William Saliba')
    THEN 20000000
    -- Average players
    ELSE 10000000
  END,
  base_price = 
  CASE 
    -- Superstars
    WHEN name IN ('Erling Haaland', 'Mohamed Salah', 'Kevin De Bruyne', 'Harry Kane', 'Son Heung-min', 'Kylian Mbappe')
    THEN 30000000
    -- Quality players
    WHEN name IN ('Bukayo Saka', 'Bruno Fernandes', 'Virgil van Dijk', 'Phil Foden', 'Trent Alexander-Arnold', 'Martin Odegaard', 'Rodri', 'William Saliba')
    THEN 20000000
    -- Average players
    ELSE 10000000
  END
WHERE league = 'EPL';

-- Update EPFL Players (Nigerian players in European leagues)
UPDATE players
SET current_price = 
  CASE 
    -- Superstars
    WHEN name IN ('Victor Osimhen', 'Ademola Lookman')
    THEN 25000000
    -- Quality players
    WHEN name IN ('Samuel Chukwueze', 'Wilfred Ndidi', 'Alex Iwobi', 'Kelechi Iheanacho')
    THEN 15000000
    -- Average players
    ELSE 8000000
  END,
  base_price = 
  CASE 
    -- Superstars
    WHEN name IN ('Victor Osimhen', 'Ademola Lookman')
    THEN 25000000
    -- Quality players
    WHEN name IN ('Samuel Chukwueze', 'Wilfred Ndidi', 'Alex Iwobi', 'Kelechi Iheanacho')
    THEN 15000000
    -- Average players
    ELSE 8000000
  END
WHERE league = 'EPFL';

-- Update NPFL Players (Nigerian Premier League)
UPDATE players
SET current_price = 
  CASE 
    -- Quality players
    WHEN name IN ('Sikiru Alimi', 'Chijioke Akuneto', 'Rabiu Ali')
    THEN 10000000
    -- Average players
    ELSE 5000000
  END,
  base_price = 
  CASE 
    -- Quality players
    WHEN name IN ('Sikiru Alimi', 'Chijioke Akuneto', 'Rabiu Ali')
    THEN 10000000
    -- Average players
    ELSE 5000000
  END
WHERE league = 'NPFL';

-- Update goalkeepers to be more affordable
UPDATE players
SET current_price = 
  CASE 
    WHEN league = 'EPL' THEN 8000000
    WHEN league = 'EPFL' THEN 6000000
    ELSE 4000000
  END,
  base_price = 
  CASE 
    WHEN league = 'EPL' THEN 8000000
    WHEN league = 'EPFL' THEN 6000000
    ELSE 4000000
  END
WHERE position = 'Goalkeeper';

-- Add a comment explaining the pricing tiers
COMMENT ON TABLE players IS 'Player data with three pricing tiers:
1. Average Players: ₦5,000,000 - ₦10,000,000
2. Quality Players: ₦10,000,000 - ₦20,000,000
3. Superstar Players: ₦20,000,000 - ₦30,000,000
This ensures teams can afford a complete squad of 15 players with their initial budget of ₦200,000,000.'; 