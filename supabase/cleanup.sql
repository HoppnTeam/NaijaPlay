-- Delete existing teams and related data
DELETE FROM team_players;
DELETE FROM teams;

-- Reset sequences
ALTER SEQUENCE team_players_id_seq RESTART WITH 1;
ALTER SEQUENCE team_transfers_id_seq RESTART WITH 1;

-- Reset player availability
UPDATE players SET is_available = true;

-- Reset player statistics (optional, uncomment if needed)
-- UPDATE players SET 
--   minutes_played = 0,
--   goals_scored = 0,
--   assists = 0,
--   clean_sheets = 0,
--   goals_conceded = 0,
--   own_goals = 0,
--   penalties_saved = 0,
--   penalties_missed = 0,
--   yellow_cards = 0,
--   red_cards = 0,
--   saves = 0,
--   bonus = 0; 