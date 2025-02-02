-- Create token_packages table
CREATE TABLE IF NOT EXISTS token_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  token_amount DECIMAL(10,2) NOT NULL,  -- Amount in millions (e.g., 100.00 for 100M)
  price DECIMAL(10,2) NOT NULL,         -- Price in Naira
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create token_purchases table
CREATE TABLE IF NOT EXISTS token_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  package_id UUID REFERENCES token_packages(id),
  amount_paid DECIMAL(10,2) NOT NULL,
  tokens_credited DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add token-related fields to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS total_tokens_purchased DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tokens_purchase_count INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS last_token_purchase TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for token_packages
CREATE POLICY "Token packages are viewable by everyone"
  ON token_packages
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify token packages"
  ON token_packages
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@naijaplay.com'
    )
  );

-- Policies for token_purchases
CREATE POLICY "Users can view their own token purchases"
  ON token_purchases
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
      'admin@naijaplay.com'
    )
  );

CREATE POLICY "Users can create their own token purchases"
  ON token_purchases
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Function to update team budget after successful token purchase
CREATE OR REPLACE FUNCTION process_token_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND 
     (OLD IS NULL OR OLD.payment_status != 'completed') THEN
    
    -- Update team budget and token purchase stats
    UPDATE teams
    SET 
      budget = budget + (NEW.tokens_credited * 1000000), -- Convert millions to actual value
      total_tokens_purchased = COALESCE(total_tokens_purchased, 0) + NEW.tokens_credited,
      tokens_purchase_count = COALESCE(tokens_purchase_count, 0) + 1,
      last_token_purchase = NEW.updated_at
    WHERE id = NEW.team_id;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for processing token purchases
CREATE TRIGGER process_token_purchase_trigger
AFTER INSERT OR UPDATE ON token_purchases
FOR EACH ROW
EXECUTE FUNCTION process_token_purchase();

-- Insert initial token packages
INSERT INTO token_packages (name, description, token_amount, price)
VALUES 
  ('Basic Boost', '100 Million Token Package', 100.00, 10000.00),
  ('Premium Boost', '200 Million Token Package', 200.00, 15000.00),
  ('Ultimate Boost', '500 Million Token Package', 500.00, 30000.00)
ON CONFLICT DO NOTHING; 