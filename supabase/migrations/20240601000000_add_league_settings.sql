-- Create league_settings table
CREATE TABLE IF NOT EXISTS public.league_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    points_per_goal NUMERIC DEFAULT 4,
    points_per_assist NUMERIC DEFAULT 3,
    points_per_clean_sheet NUMERIC DEFAULT 4,
    points_per_penalty_save NUMERIC DEFAULT 5,
    points_per_penalty_miss NUMERIC DEFAULT -2,
    points_per_yellow_card NUMERIC DEFAULT -1,
    points_per_red_card NUMERIC DEFAULT -3,
    points_per_own_goal NUMERIC DEFAULT -2,
    points_per_save NUMERIC DEFAULT 0.5,
    points_per_goal_conceded NUMERIC DEFAULT -1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(league_id)
);

-- Add RLS policies for league_settings
ALTER TABLE public.league_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view league settings" 
ON public.league_settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "League creators can update league settings" 
ON public.league_settings FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.leagues l
        WHERE l.id = league_settings.league_id
        AND l.created_by = auth.uid()
    )
);

-- Add trigger for updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at ON public.league_settings;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.league_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 