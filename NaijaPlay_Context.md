# NaijaPlay Fantasy Football - Project Context

## Project Overview
NaijaPlay is a Nigerian Fantasy Football platform built with Next.js 14, Supabase, and Tailwind CSS. The application allows users to create fantasy football teams, manage squads, participate in leagues, and earn tokens through various activities.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **Authentication**: Supabase Auth
- **Caching**: Redis (Upstash)
- **Payment**: Paystack Integration
- **Deployment**: Vercel (implied)

## Core Features Implemented

### Authentication System
- Email/password login and signup
- Protected routes with middleware
- User profiles with role-based access

### Team Management
- Team creation with budget constraints
- Squad building with position requirements
- Captain and vice-captain selection
- Starting XI selection (exactly 11 players)
- Formation visualization

### Token System
- Token purchase via Paystack
- Token balance tracking
- Budget top-ups using tokens (1 token = 0.5M budget)
- Daily login rewards (increasing rewards for consecutive logins)
- Weekly challenges with token rewards

### League System
- League creation and joining
- League leaderboards
- Prize distribution configuration
- League owner incentives

### Match & Statistics
- Live match tracking
- Player and team statistics
- Match simulation engine
- Historical performance data

### Wallet & Betting
- Wallet system for financial transactions
- Betting on matches and player performance
- Transaction history

## Project Structure
- `app/`: Next.js app router pages and API routes
- `components/`: React components organized by feature
- `hooks/`: Custom React hooks for data fetching and state management
- `lib/`: Utility functions and configuration
- `supabase/`: Database migrations and seed data
- `types/`: TypeScript type definitions
- `public/`: Static assets

## Database Schema
The database includes tables for:
- Users and profiles
- Teams and players
- Team-player relationships
- Leagues and memberships
- Tokens and transactions
- Matches and gameweeks
- Betting and wallet

## Current Development Status
- Core authentication and team management features are working
- Token system is fully implemented with budget top-ups, daily rewards, and weekly challenges



## Development Environment
- Local Supabase instance available for development
- Environment switching between local and production
- Migration scripts to copy data between environments

## Next Development Priorities
1. Complete the Gameweek System

3. Enhance League Management features
4. Implement Player Market with value fluctuation

## Known Issues
- Some server errors in betting components
- Wallet component error handling needs improvement
- Missing database tables for some betting functionality

This context represents the state of the NaijaPlay Fantasy Football project as of our last conversation. Use this as a reference when continuing development work. 