-- Add more EPL players to the database
INSERT INTO players (
  name, position, team, league, current_price, base_price, 
  minutes_played, goals_scored, assists, clean_sheets, form_rating, ownership_percent
) VALUES
  -- EPL Players
  ('Bukayo Saka', 'Midfielder', 'Arsenal', 'EPL', 85000000, 85000000, 450, 6, 4, 0, 8.2, 15.5),
  ('Erling Haaland', 'Forward', 'Manchester City', 'EPL', 150000000, 150000000, 360, 10, 2, 0, 9.0, 45.2),
  ('Mohamed Salah', 'Forward', 'Liverpool', 'EPL', 130000000, 130000000, 540, 8, 5, 0, 8.5, 35.4),
  ('Bruno Fernandes', 'Midfielder', 'Manchester United', 'EPL', 95000000, 95000000, 480, 3, 6, 0, 7.8, 25.8),
  ('Virgil van Dijk', 'Defender', 'Liverpool', 'EPL', 75000000, 75000000, 520, 1, 0, 6, 7.5, 18.5),
  ('Alisson', 'Goalkeeper', 'Liverpool', 'EPL', 65000000, 65000000, 540, 0, 0, 6, 7.8, 22.2),
  ('Kevin De Bruyne', 'Midfielder', 'Manchester City', 'EPL', 120000000, 120000000, 420, 4, 8, 0, 8.7, 30.5),
  ('Harry Kane', 'Forward', 'Bayern Munich', 'EPL', 140000000, 140000000, 540, 9, 3, 0, 8.6, 32.8),
  ('Phil Foden', 'Midfielder', 'Manchester City', 'EPL', 90000000, 90000000, 450, 5, 4, 0, 8.3, 22.5),
  ('Trent Alexander-Arnold', 'Defender', 'Liverpool', 'EPL', 80000000, 80000000, 500, 1, 7, 5, 8.0, 20.2),
  ('Ederson', 'Goalkeeper', 'Manchester City', 'EPL', 60000000, 60000000, 540, 0, 0, 7, 7.9, 18.5),
  ('Son Heung-min', 'Forward', 'Tottenham', 'EPL', 110000000, 110000000, 520, 7, 4, 0, 8.4, 28.5),
  ('Martin Odegaard', 'Midfielder', 'Arsenal', 'EPL', 85000000, 85000000, 480, 4, 6, 0, 8.1, 20.8),
  ('Rodri', 'Midfielder', 'Manchester City', 'EPL', 75000000, 75000000, 540, 2, 3, 0, 7.9, 15.5),
  ('William Saliba', 'Defender', 'Arsenal', 'EPL', 70000000, 70000000, 540, 0, 0, 7, 7.8, 16.2),
  ('David Raya', 'Goalkeeper', 'Arsenal', 'EPL', 55000000, 55000000, 540, 0, 0, 7, 7.7, 14.5);

-- Make sure all players are available
UPDATE players SET is_available = true WHERE is_available IS NULL; 