# NaijaPlay Match Simulation Feature

This document provides an overview of the Match Simulation feature implemented for the NaijaPlay Fantasy Football platform.

## Overview

The Match Simulation feature allows users to view real-time player performance data, live match scores, and upcoming fixtures. This is a crucial component of the fantasy football experience, as it enables users to track how their selected players are performing in real matches.

## Components

### 1. Match Simulation Page

Located at: `app/(dashboard)/dashboard/match-simulation/page.tsx`

This is the main page that integrates all the components and fetches data from the Supabase database. It includes:

- Authentication checks to ensure only logged-in users can access the page
- Data fetching for player performances, live matches, and upcoming fixtures
- A tabbed interface to switch between different views

### 2. Player Performance List

Located at: `components/dashboard/player-performance-list.tsx`

This component displays detailed player performance statistics:

- Search functionality to find specific players
- Filtering by position (GK, DEF, MID, FWD) and league (NPFL, EPL)
- A comprehensive table showing key performance metrics:
  - Minutes played
  - Goals scored
  - Assists
  - Clean sheets
  - Yellow/red cards
  - Saves
  - Total points

### 3. Live Matches List

Located at: `components/dashboard/live-matches-list.tsx`

This component shows matches currently in progress:

- Filtering by league (All, NPFL, EPL)
- Real-time score updates
- Match status indicators
- Match time/minute tracking

### 4. Upcoming Fixtures

Located at: `components/dashboard/upcoming-fixtures.tsx`

This component displays scheduled matches:

- Grouping by date for easy navigation
- Filtering by league (All, NPFL, EPL)
- Match time information
- Team matchups

### 5. Database Schema

Located at: `lib/database-schema.ts`

This file defines the TypeScript interfaces for our database entities and provides helper functions to transform Supabase responses into our application's data structures.

## Data Flow

1. The Match Simulation page fetches raw data from Supabase
2. The data is transformed using helper functions from the database schema
3. The transformed data is passed to the appropriate components
4. Each component handles filtering and display logic

## Future Enhancements

Potential improvements for the Match Simulation feature:

1. **Real-time updates**: Implement WebSockets or polling to update match data without requiring manual refresh
2. **Player statistics visualization**: Add charts and graphs to visualize player performance trends
3. **Match events timeline**: Show key events (goals, cards, substitutions) in a timeline format
4. **Personalized view**: Allow users to filter for players in their fantasy team
5. **Notifications**: Alert users when their players score or earn points

## Technical Implementation

- Built with Next.js 14 and React
- Uses Supabase for data storage and retrieval
- Implements client-side filtering and sorting
- Responsive design for mobile and desktop viewing
- Type-safe implementation with TypeScript 