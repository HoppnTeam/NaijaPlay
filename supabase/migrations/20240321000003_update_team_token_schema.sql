-- Add budget constraints and token management fields to teams table
ALTER TABLE teams 
  ADD CONSTRAINT budget_min_check CHECK (budget >= 0),
  ADD CONSTRAINT budget_max_check CHECK (budget <= 500000000);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_budget ON teams(budget);
CREATE INDEX IF NOT EXISTS idx_teams_total_tokens_purchased ON teams(total_tokens_purchased);
CREATE INDEX IF NOT EXISTS idx_token_purchases_user_id ON token_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_token_purchases_team_id ON token_purchases(team_id);
CREATE INDEX IF NOT EXISTS idx_token_purchases_status ON token_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_token_purchases_created_at ON token_purchases(created_at);

-- Create a view for token purchase statistics
CREATE OR REPLACE VIEW team_token_stats AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.budget,
  COALESCE(t.total_tokens_purchased, 0) as total_tokens_purchased,
  COALESCE(t.tokens_purchase_count, 0) as purchase_count,
  t.last_token_purchase,
  COUNT(tp.id) as pending_purchases,
  SUM(CASE WHEN tp.payment_status = 'completed' THEN tp.tokens_credited ELSE 0 END) as verified_tokens,
  SUM(CASE WHEN tp.payment_status = 'completed' THEN tp.amount_paid ELSE 0 END) as total_spent
FROM teams t
LEFT JOIN token_purchases tp ON t.id = tp.team_id
GROUP BY t.id, t.name, t.budget, t.total_tokens_purchased, t.tokens_purchase_count, t.last_token_purchase;

-- Create function to validate token purchase
CREATE OR REPLACE FUNCTION validate_token_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if team exists and user owns it
  IF NOT EXISTS (
    SELECT 1 FROM teams 
    WHERE id = NEW.team_id 
    AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Invalid team or unauthorized';
  END IF;

  -- Check if package exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM token_packages 
    WHERE id = NEW.package_id 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid or inactive token package';
  END IF;

  -- Check for pending purchases
  IF EXISTS (
    SELECT 1 FROM token_purchases
    WHERE team_id = NEW.team_id
    AND payment_status = 'pending'
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Team has pending token purchases';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for token purchase validation
CREATE TRIGGER validate_token_purchase_trigger
BEFORE INSERT OR UPDATE ON token_purchases
FOR EACH ROW
EXECUTE FUNCTION validate_token_purchase();

-- Create function to update team stats after successful purchase
CREATE OR REPLACE FUNCTION update_team_token_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND 
     (OLD IS NULL OR OLD.payment_status != 'completed') THEN
    
    UPDATE teams
    SET 
      total_tokens_purchased = COALESCE(total_tokens_purchased, 0) + NEW.tokens_credited,
      tokens_purchase_count = COALESCE(tokens_purchase_count, 0) + 1,
      last_token_purchase = NEW.updated_at
    WHERE id = NEW.team_id;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating team stats
CREATE TRIGGER update_team_token_stats_trigger
AFTER INSERT OR UPDATE ON token_purchases
FOR EACH ROW
EXECUTE FUNCTION update_team_token_stats();

-- Add policies for token stats view
CREATE POLICY "Users can view their own team stats"
  ON team_token_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.user_id = auth.uid()
    )
  ); 