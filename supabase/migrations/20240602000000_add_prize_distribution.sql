-- Create league_prize_distribution table
CREATE TABLE IF NOT EXISTS public.league_prize_distribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    percentage NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(league_id, position),
    CONSTRAINT valid_percentage CHECK (percentage >= 0 AND percentage <= 100)
);

-- Add additional fields to leagues table for prize pool management
ALTER TABLE public.leagues 
ADD COLUMN IF NOT EXISTS prize_pool_funded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS additional_prize_amount BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS prize_distribution_type TEXT DEFAULT 'standard' CHECK (prize_distribution_type IN ('standard', 'custom')),
ADD COLUMN IF NOT EXISTS prize_distribution_finalized BOOLEAN DEFAULT false;

-- Create default prize distribution templates
CREATE TABLE IF NOT EXISTS public.prize_distribution_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    positions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert standard prize distribution templates
INSERT INTO public.prize_distribution_templates (name, description, is_default, positions)
VALUES 
    ('Standard (Top 3)', 'Standard prize distribution for top 3 positions', true, 
     '[{"position": 1, "percentage": 50}, {"position": 2, "percentage": 30}, {"position": 3, "percentage": 20}]'),
    ('Winner Takes All', 'All prize money goes to the first place', false, 
     '[{"position": 1, "percentage": 100}]'),
    ('Top 4', 'Prize distribution for top 4 positions', false, 
     '[{"position": 1, "percentage": 50}, {"position": 2, "percentage": 25}, {"position": 3, "percentage": 15}, {"position": 4, "percentage": 10}]'),
    ('Top 5', 'Prize distribution for top 5 positions', false, 
     '[{"position": 1, "percentage": 40}, {"position": 2, "percentage": 25}, {"position": 3, "percentage": 15}, {"position": 4, "percentage": 10}, {"position": 5, "percentage": 10}]');

-- Add RLS policies for league_prize_distribution
ALTER TABLE public.league_prize_distribution ENABLE ROW LEVEL SECURITY;

-- Anyone can view prize distributions
CREATE POLICY "Anyone can view prize distributions" 
ON public.league_prize_distribution FOR SELECT 
USING (true);

-- Only league creators can manage prize distributions
CREATE POLICY "League creators can manage prize distributions" 
ON public.league_prize_distribution FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.leagues l
        WHERE l.id = league_prize_distribution.league_id
        AND l.created_by = auth.uid()
    )
);

-- Add RLS policies for prize_distribution_templates
ALTER TABLE public.prize_distribution_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view prize distribution templates
CREATE POLICY "Anyone can view prize distribution templates" 
ON public.prize_distribution_templates FOR SELECT 
USING (true);

-- Only admins can manage prize distribution templates
CREATE POLICY "Admins can manage prize distribution templates" 
ON public.prize_distribution_templates FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Add triggers for updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at ON public.league_prize_distribution;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.league_prize_distribution
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.prize_distribution_templates;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.prize_distribution_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 