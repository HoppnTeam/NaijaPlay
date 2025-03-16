-- Create health_checks table
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL,
  message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial health check
INSERT INTO health_checks (status, message)
VALUES ('ok', 'System is healthy');

-- Create gameweeks table
CREATE TABLE IF NOT EXISTS gameweeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some initial gameweeks
INSERT INTO gameweeks (id, number, start_date, end_date, status)
VALUES 
  (uuid_generate_v4(), 1, '2024-03-01', '2024-03-07', 'completed'),
  (uuid_generate_v4(), 2, '2024-03-08', '2024-03-14', 'completed'),
  (uuid_generate_v4(), 3, '2024-03-15', '2024-03-21', 'in_progress'),
  (uuid_generate_v4(), 4, '2024-03-22', '2024-03-28', 'upcoming');

-- Create match_history table
CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  gameweek_id UUID REFERENCES gameweeks(id),
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_gameweek_stats table
CREATE TABLE IF NOT EXISTS team_gameweek_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) NOT NULL,
  gameweek_id UUID REFERENCES gameweeks(id) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, gameweek_id)
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  value INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some initial token packs
INSERT INTO tokens (id, name, description, price, value, is_active)
VALUES 
  (uuid_generate_v4(), 'Basic Token Pack', '100 tokens for basic gameplay', 1000, 100, true),
  (uuid_generate_v4(), 'Premium Token Pack', '500 tokens for premium gameplay', 4500, 500, true),
  (uuid_generate_v4(), 'Ultimate Token Pack', '1000 tokens for ultimate gameplay', 8000, 1000, true);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  reference TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
