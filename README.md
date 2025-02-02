# NaijaPlay Fantasy Football

A Nigerian Fantasy Football platform built with Next.js, Supabase, and Tailwind CSS.

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── players/           # Player management endpoints
│   │   └── team/              # Team management endpoints
├── components/
│   ├── team/
│   │   └── squad-management.tsx   # Squad management component
│   └── transfer-market.tsx    # Transfer market component
├── supabase/
│   ├── migrations/            # Database migrations
│   └── seed_data/            # Seed data for players
```

## Features Implemented

### 1. Squad Management
- View current squad members
- Set captain and vice-captain
- List players for sale
- Squad completeness check (minimum 15 players)
- Position-based organization

### 2. Transfer Market
- Browse available players
- Search and filter functionality
- Pagination (12 players per page)
- Player purchase system
- Budget management in Naira

### 3. Database Setup
- Players table with indexes
- Row Level Security
- Automatic timestamps
- Transfer transaction handling

## Development Progress

### Completed
- Basic UI components
- Squad management interface
- Transfer market with pagination
- Player data seeding
- API endpoints for player actions

### In Progress
- Squad List display
- Transfer Market population
- Player purchase functionality

### Next Steps
1. Test player purchase flow
2. Verify squad management updates
3. Add more Nigerian players to seed data
4. Implement player selling feature

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Supabase:
   - Run migrations
   - Execute seed script
   ```bash
   supabase db reset
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  team TEXT NOT NULL,
  current_price BIGINT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Team Players Table
```sql
CREATE TABLE team_players (
  team_id UUID REFERENCES teams(id),
  player_id UUID REFERENCES players(id),
  is_captain BOOLEAN DEFAULT false,
  is_vice_captain BOOLEAN DEFAULT false,
  for_sale BOOLEAN DEFAULT false,
  purchase_price BIGINT NOT NULL
);
``` 