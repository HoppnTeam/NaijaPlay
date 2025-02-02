-- Create enum for bet types
CREATE TYPE bet_type AS ENUM ('team', 'player');

-- Create enum for bet status
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost', 'draw', 'cancelled');

-- Create table for storing bets
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_type bet_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  potential_win DECIMAL(10,2) NOT NULL CHECK (potential_win > 0),
  status bet_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  gameweek INTEGER NOT NULL CHECK (gameweek > 0 AND gameweek <= 38),
  
  -- For team bets
  team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  selected_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team1_points INTEGER,
  team2_points INTEGER,
  
  -- For player bets
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  metric VARCHAR(20), -- 'goals', 'assists', 'clean_sheets'
  prediction INTEGER CHECK (prediction >= 0 AND prediction <= 10),
  actual_value INTEGER,
  
  -- Constraints
  CONSTRAINT valid_bet_type_fields CHECK (
    (bet_type = 'team' AND team1_id IS NOT NULL AND team2_id IS NOT NULL AND selected_team_id IS NOT NULL 
     AND player_id IS NULL AND metric IS NULL AND prediction IS NULL)
    OR 
    (bet_type = 'player' AND player_id IS NOT NULL AND metric IS NOT NULL AND prediction IS NOT NULL 
     AND team1_id IS NULL AND team2_id IS NULL AND selected_team_id IS NULL)
  ),
  CONSTRAINT different_teams CHECK (
    bet_type != 'team' OR (team1_id != team2_id)
  )
);

-- Create index for faster queries
CREATE INDEX bets_user_id_idx ON bets(user_id);
CREATE INDEX bets_status_idx ON bets(status);
CREATE INDEX bets_gameweek_idx ON bets(gameweek);

-- Create function to update user balance when bet is placed
CREATE OR REPLACE FUNCTION place_bet()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct bet amount from user balance
  UPDATE users 
  SET balance = balance - NEW.amount
  WHERE id = NEW.user_id 
  AND balance >= NEW.amount;
  
  -- If update failed (insufficient balance), prevent bet creation
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle bet placement
CREATE TRIGGER bet_placed
  BEFORE INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION place_bet();

-- Create function to update user balance when bet is settled
CREATE OR REPLACE FUNCTION settle_bet()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status is changing from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    -- Add winnings to user balance if bet was won
    IF NEW.status = 'won' THEN
      UPDATE users 
      SET balance = balance + NEW.potential_win
      WHERE id = NEW.user_id;
    -- Return original stake if bet was a draw or cancelled
    ELSIF NEW.status IN ('draw', 'cancelled') THEN
      UPDATE users 
      SET balance = balance + NEW.amount
      WHERE id = NEW.user_id;
    END IF;
    
    -- Update settled timestamp
    NEW.settled_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle bet settlement
CREATE TRIGGER bet_settled
  BEFORE UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION settle_bet();

-- Create RLS policies
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bets"
  ON bets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets"
  ON bets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only allow updates to status field and only by service role
CREATE POLICY "Only service role can settle bets"
  ON bets FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (
    OLD.status = 'pending' 
    AND NEW.status IN ('won', 'lost', 'draw', 'cancelled')
    AND OLD.user_id = NEW.user_id
    AND OLD.bet_type = NEW.bet_type
    AND OLD.amount = NEW.amount
    AND OLD.potential_win = NEW.potential_win
    AND OLD.gameweek = NEW.gameweek
    AND OLD.team1_id IS NOT DISTINCT FROM NEW.team1_id
    AND OLD.team2_id IS NOT DISTINCT FROM NEW.team2_id
    AND OLD.selected_team_id IS NOT DISTINCT FROM NEW.selected_team_id
    AND OLD.player_id IS NOT DISTINCT FROM NEW.player_id
    AND OLD.metric IS NOT DISTINCT FROM NEW.metric
    AND OLD.prediction IS NOT DISTINCT FROM NEW.prediction
  ); 