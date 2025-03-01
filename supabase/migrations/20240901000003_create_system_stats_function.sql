-- Create function to get system stats
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_users integer;
    active_teams integer;
    total_leagues integer;
    total_revenue numeric;
    user_growth numeric;
    team_growth numeric;
    league_growth numeric;
    revenue_growth numeric;
BEGIN
    -- Get total users
    SELECT COUNT(*) INTO total_users FROM profiles;
    
    -- Get active teams
    SELECT COUNT(*) INTO active_teams FROM teams;
    
    -- Get total leagues
    SELECT COUNT(*) INTO total_leagues FROM leagues;
    
    -- Get total revenue (from transactions)
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue 
    FROM transactions 
    WHERE status = 'completed';
    
    -- Calculate growth percentages (comparing to last month)
    WITH monthly_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month') as current_users,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' AND created_at < NOW() - INTERVAL '1 month') as prev_users
        FROM profiles
    )
    SELECT 
        CASE 
            WHEN prev_users = 0 THEN 100
            ELSE ((current_users - prev_users)::float / prev_users * 100)
        END INTO user_growth
    FROM monthly_stats;
    
    -- Calculate team growth
    WITH monthly_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month') as current_teams,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' AND created_at < NOW() - INTERVAL '1 month') as prev_teams
        FROM teams
    )
    SELECT 
        CASE 
            WHEN prev_teams = 0 THEN 100
            ELSE ((current_teams - prev_teams)::float / prev_teams * 100)
        END INTO team_growth
    FROM monthly_stats;
    
    -- Calculate league growth
    WITH monthly_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month') as current_leagues,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' AND created_at < NOW() - INTERVAL '1 month') as prev_leagues
        FROM leagues
    )
    SELECT 
        CASE 
            WHEN prev_leagues = 0 THEN 100
            ELSE ((current_leagues - prev_leagues)::float / prev_leagues * 100)
        END INTO league_growth
    FROM monthly_stats;
    
    -- Calculate revenue growth
    WITH monthly_stats AS (
        SELECT 
            COALESCE(SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month'), 0) as current_revenue,
            COALESCE(SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' AND created_at < NOW() - INTERVAL '1 month'), 0) as prev_revenue
        FROM transactions
        WHERE status = 'completed'
    )
    SELECT 
        CASE 
            WHEN prev_revenue = 0 THEN 100
            ELSE ((current_revenue - prev_revenue) / prev_revenue * 100)
        END INTO revenue_growth
    FROM monthly_stats;
    
    -- Return stats as JSON
    RETURN json_build_object(
        'totalUsers', total_users,
        'activeTeams', active_teams,
        'totalLeagues', total_leagues,
        'revenue', total_revenue,
        'userGrowth', ROUND(user_growth::numeric, 1),
        'teamGrowth', ROUND(team_growth::numeric, 1),
        'leagueGrowth', ROUND(league_growth::numeric, 1),
        'revenueGrowth', ROUND(revenue_growth::numeric, 1)
    );
END;
$$; 