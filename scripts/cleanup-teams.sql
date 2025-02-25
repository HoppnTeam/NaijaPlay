-- Disable foreign key checks temporarily for cleanup
BEGIN;

-- Clean up team-related tables in order of dependencies
DELETE FROM team_players;
DELETE FROM team_transfers;
DELETE FROM team_statistics;
DELETE FROM league_members WHERE team_id IS NOT NULL;
DELETE FROM teams;

-- Reset sequences if any
ALTER SEQUENCE teams_id_seq RESTART WITH 1;
ALTER SEQUENCE team_players_id_seq RESTART WITH 1;
ALTER SEQUENCE team_transfers_id_seq RESTART WITH 1;

-- Delete existing team and its players
DELETE FROM team_players WHERE team_id IN (
  SELECT id FROM teams WHERE name = 'UCH stars'
);
DELETE FROM teams WHERE name = 'UCH stars';

-- Reset players to be available
UPDATE players SET is_available = true;

COMMIT; 