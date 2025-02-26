-- Create league_pricing table
CREATE TABLE IF NOT EXISTS public.league_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default pricing tiers
INSERT INTO public.league_pricing (name, description, price, features)
VALUES 
    ('Free', 'Basic league with limited features', 0, '{"max_teams": 8, "advanced_stats": false, "custom_scoring": false, "priority_support": false}'),
    ('Premium', 'Enhanced league with more features', 5000, '{"max_teams": 16, "advanced_stats": true, "custom_scoring": true, "priority_support": false}'),
    ('Pro', 'Professional league with all features', 15000, '{"max_teams": 32, "advanced_stats": true, "custom_scoring": true, "priority_support": true}');

-- Add league_tier_id to leagues table
ALTER TABLE public.leagues 
ADD COLUMN IF NOT EXISTS league_tier_id UUID REFERENCES public.league_pricing(id);

-- Add platform_fee_percentage to leagues table
ALTER TABLE public.leagues 
ADD COLUMN IF NOT EXISTS platform_fee_percentage INTEGER DEFAULT 10;

-- Enable RLS on league_pricing
ALTER TABLE public.league_pricing ENABLE ROW LEVEL SECURITY;

-- Create policy for reading league pricing
CREATE POLICY "Anyone can read league pricing" 
ON public.league_pricing FOR SELECT 
USING (true);

-- Create policy for admins to manage league pricing
CREATE POLICY "Admins can manage league pricing" 
ON public.league_pricing FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Add trigger for updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at ON public.league_pricing;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.league_pricing
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 