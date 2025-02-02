-- Sample Leagues Data
INSERT INTO public.leagues (
  id,
  name,
  type,
  max_teams,
  entry_fee,
  total_prize,
  start_date,
  end_date,
  status,
  created_at
) VALUES 
(
  gen_random_uuid(),
  'NPFL Pro League 2024',
  'NPFL',
  20,
  5000,
  1000000,
  '2024-03-01',
  '2024-05-30',
  'upcoming',
  NOW()
),
(
  gen_random_uuid(),
  'NPFL Rising Stars',
  'NPFL',
  30,
  2000,
  500000,
  '2024-03-15',
  '2024-06-15',
  'upcoming',
  NOW()
),
(
  gen_random_uuid(),
  'EPL Masters League',
  'EPL',
  16,
  10000,
  2000000,
  '2024-03-01',
  '2024-05-30',
  'upcoming',
  NOW()
),
(
  gen_random_uuid(),
  'EPL Classic League',
  'EPL',
  24,
  5000,
  1000000,
  '2024-03-10',
  '2024-06-10',
  'upcoming',
  NOW()
); 