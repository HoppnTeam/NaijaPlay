-- Add start_date and end_date fields to leagues table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leagues' 
        AND column_name = 'start_date'
    ) THEN
        ALTER TABLE public.leagues ADD COLUMN start_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leagues' 
        AND column_name = 'end_date'
    ) THEN
        ALTER TABLE public.leagues ADD COLUMN end_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leagues' 
        AND column_name = 'total_prize'
    ) THEN
        ALTER TABLE public.leagues ADD COLUMN total_prize BIGINT DEFAULT 0;
    END IF;
END
$$; 