-- Re-insert all players after database reset
-- This migration ensures players are added back after seed.sql truncates the table

-- Nigerian Players in EPL and other European leagues
INSERT INTO players (
  name, position, team, league, current_price, base_price, 
  minutes_played, goals_scored, assists, clean_sheets, form_rating, ownership_percent
) VALUES
  ('Victor Osimhen', 'Forward', 'Napoli', 'EPFL', 100000000, 100000000, 450, 8, 2, 0, 8.5, 25.5),
  ('Samuel Chukwueze', 'Forward', 'AC Milan', 'EPFL', 65000000, 65000000, 360, 4, 3, 0, 7.2, 15.2),
  ('Wilfred Ndidi', 'Midfielder', 'Leicester City', 'EPFL', 55000000, 55000000, 540, 1, 4, 2, 7.8, 18.4),
  ('Alex Iwobi', 'Midfielder', 'Fulham', 'EPFL', 45000000, 45000000, 480, 2, 5, 1, 7.5, 12.8),
  ('Calvin Bassey', 'Defender', 'Fulham', 'EPFL', 35000000, 35000000, 520, 0, 1, 4, 7.1, 8.5),
  ('Francis Uzoho', 'Goalkeeper', 'Omonia', 'EPFL', 25000000, 25000000, 540, 0, 0, 3, 6.8, 5.2),
  ('Ademola Lookman', 'Forward', 'Atalanta', 'EPFL', 70000000, 70000000, 420, 6, 4, 0, 8.0, 20.5),
  ('Kelechi Iheanacho', 'Forward', 'Leicester City', 'EPFL', 50000000, 50000000, 380, 5, 2, 0, 7.4, 15.8),
  ('Joe Aribo', 'Midfielder', 'Southampton', 'EPFL', 40000000, 40000000, 450, 2, 3, 1, 7.0, 10.2),
  ('Ola Aina', 'Defender', 'Nottingham Forest', 'EPFL', 30000000, 30000000, 500, 1, 2, 3, 7.2, 8.0),
  ('Maduka Okoye', 'Goalkeeper', 'Udinese', 'EPFL', 20000000, 20000000, 450, 0, 0, 2, 6.5, 4.5);

-- Nigerian Premier League (NPFL) Players
INSERT INTO players (
  name, position, team, league, current_price, base_price, 
  minutes_played, goals_scored, assists, clean_sheets, form_rating, ownership_percent
) VALUES
  ('Sikiru Alimi', 'Forward', 'Remo Stars', 'NPFL', 35000000, 35000000, 540, 7, 3, 0, 7.8, 18.5),
  ('Chijioke Akuneto', 'Forward', 'Rivers United', 'NPFL', 30000000, 30000000, 520, 6, 2, 0, 7.5, 16.2),
  ('Rabiu Ali', 'Midfielder', 'Kano Pillars', 'NPFL', 25000000, 25000000, 540, 4, 5, 1, 7.6, 15.4),
  ('Enyimba Ojo', 'Midfielder', 'Enyimba FC', 'NPFL', 22000000, 22000000, 500, 3, 4, 2, 7.3, 12.8),
  ('Tope Olusesi', 'Defender', 'Rangers International', 'NPFL', 18000000, 18000000, 540, 0, 1, 5, 7.0, 10.5),
  ('Amas Obasogie', 'Goalkeeper', 'Bendel Insurance', 'NPFL', 15000000, 15000000, 540, 0, 0, 6, 7.2, 8.5),
  ('Mfon Udoh', 'Forward', 'Akwa United', 'NPFL', 28000000, 28000000, 480, 5, 2, 0, 7.4, 14.2),
  ('Ibrahim Sunusi', 'Forward', 'Nasarawa United', 'NPFL', 26000000, 26000000, 500, 4, 3, 0, 7.2, 13.5),
  ('Nwagua Nyima', 'Midfielder', 'Kano Pillars', 'NPFL', 20000000, 20000000, 520, 2, 4, 1, 7.0, 11.8),
  ('Ifeanyi Anaemena', 'Defender', 'Rivers United', 'NPFL', 16000000, 16000000, 540, 1, 0, 4, 6.8, 9.2),
  ('Theophilus Afelokhai', 'Goalkeeper', 'Enyimba FC', 'NPFL', 14000000, 14000000, 520, 0, 0, 5, 6.9, 7.5);

-- EPL Players
INSERT INTO players (
  name, position, team, league, current_price, base_price, 
  minutes_played, goals_scored, assists, clean_sheets, form_rating, ownership_percent
) VALUES
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
  ('David Raya', 'Goalkeeper', 'Arsenal', 'EPL', 55000000, 55000000, 540, 0, 0, 7, 7.7, 14.5),
  ('Kylian Mbappe', 'Forward', 'Real Madrid', 'EPL', 200000000, 200000000, 540, 12, 6, 0, 9.5, 50.0);

-- Make sure all players are available
UPDATE players SET is_available = true WHERE is_available IS NULL; 