-- Drop existing table if it exists
DROP TABLE IF EXISTS public.user_activities;

-- Create user_activities table
CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Only admins can view activities
CREATE POLICY "Only admins can view activities"
    ON public.user_activities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- System can insert activities
CREATE POLICY "System can insert activities"
    ON public.user_activities
    FOR INSERT
    WITH CHECK (true);

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action TEXT,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO public.user_activities (user_id, action, details)
    VALUES (p_user_id, p_action, p_details)
    RETURNING id INTO v_activity_id;
    
    RETURN v_activity_id;
END;
$$;

-- Create index for faster queries
CREATE INDEX user_activities_user_id_idx ON public.user_activities(user_id);
CREATE INDEX user_activities_created_at_idx ON public.user_activities(created_at DESC);

-- Add some sample activities
INSERT INTO public.user_activities (user_id, action, details)
SELECT 
    id as user_id,
    'account_created' as action,
    jsonb_build_object('email', email) as details
FROM auth.users
WHERE created_at >= NOW() - INTERVAL '30 days'
ON CONFLICT DO NOTHING; 