-- Update profiles table with new fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS favorite_team TEXT,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT false;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- 'trophy', 'medal', or 'star'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Insert some default achievements
INSERT INTO public.achievements (title, description, icon) VALUES
('First Team Created', 'Created your first fantasy team', 'trophy'),
('League Pioneer', 'Created your first fantasy league', 'medal'),
('Social Butterfly', 'Joined 5 different leagues', 'star'),
('Top Manager', 'Finished in the top 3 of any league', 'trophy'),
('Perfect Squad', 'Created a team using the full budget', 'medal'),
('Strategy Master', 'Changed team formation 3 times in a season', 'star'),
('Captain Leader', 'Your team captain scored in 3 consecutive games', 'trophy'),
('Transfer Guru', 'Made 10 successful transfers in a season', 'medal'),
('League Champion', 'Won a fantasy league', 'trophy'),
('Rising Star', 'Achieved 3 achievements in your first month', 'star')
ON CONFLICT DO NOTHING; 