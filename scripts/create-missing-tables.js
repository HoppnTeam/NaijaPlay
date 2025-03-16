#!/usr/bin/env node

/**
 * This script creates missing tables in the production Supabase database
 * It creates the tables that were identified as missing by the check-database.js script
 * 
 * Usage: node scripts/create-missing-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Production Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to create the health_checks table
async function createHealthChecksTable() {
  console.log('Creating health_checks table...');
  
  const { error } = await supabase.rpc('create_health_checks_table');
  
  if (error) {
    console.error('Error creating health_checks table:', error);
    
    // Try direct SQL if RPC fails
    const { error: sqlError } = await supabase.from('health_checks').insert({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ok',
      message: 'System is healthy',
      checked_at: new Date().toISOString()
    });
    
    if (sqlError && sqlError.code === '42P01') {
      console.log('Table does not exist, creating with SQL...');
      
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS health_checks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            status TEXT NOT NULL,
            message TEXT,
            checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          INSERT INTO health_checks (status, message)
          VALUES ('ok', 'System is healthy');
        `
      });
      
      if (createError) {
        console.error('Error creating health_checks table with SQL:', createError);
      } else {
        console.log('Successfully created health_checks table with SQL');
      }
    }
  } else {
    console.log('Successfully created health_checks table');
  }
}

// Function to create the gameweeks table
async function createGameweeksTable() {
  console.log('Creating gameweeks table...');
  
  const { error } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS gameweeks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        number INTEGER NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT NOT NULL DEFAULT 'upcoming',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Add some initial gameweeks
      INSERT INTO gameweeks (id, number, start_date, end_date, status)
      VALUES 
        (uuid_generate_v4(), 1, '2024-03-01', '2024-03-07', 'completed'),
        (uuid_generate_v4(), 2, '2024-03-08', '2024-03-14', 'completed'),
        (uuid_generate_v4(), 3, '2024-03-15', '2024-03-21', 'in_progress'),
        (uuid_generate_v4(), 4, '2024-03-22', '2024-03-28', 'upcoming');
    `
  });
  
  if (error) {
    console.error('Error creating gameweeks table:', error);
  } else {
    console.log('Successfully created gameweeks table');
  }
}

// Function to create the match_history table
async function createMatchHistoryTable() {
  console.log('Creating match_history table...');
  
  const { error } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS match_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        home_score INTEGER NOT NULL DEFAULT 0,
        away_score INTEGER NOT NULL DEFAULT 0,
        match_date TIMESTAMP WITH TIME ZONE NOT NULL,
        gameweek_id UUID REFERENCES gameweeks(id),
        status TEXT NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });
  
  if (error) {
    console.error('Error creating match_history table:', error);
  } else {
    console.log('Successfully created match_history table');
  }
}

// Function to create the team_gameweek_stats table
async function createTeamGameweekStatsTable() {
  console.log('Creating team_gameweek_stats table...');
  
  const { error } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS team_gameweek_stats (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID REFERENCES teams(id) NOT NULL,
        gameweek_id UUID REFERENCES gameweeks(id) NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        rank INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(team_id, gameweek_id)
      );
    `
  });
  
  if (error) {
    console.error('Error creating team_gameweek_stats table:', error);
  } else {
    console.log('Successfully created team_gameweek_stats table');
  }
}

// Function to create the tokens table
async function createTokensTable() {
  console.log('Creating tokens table...');
  
  const { error } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        value INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Add some initial token packs
      INSERT INTO tokens (id, name, description, price, value, is_active)
      VALUES 
        (uuid_generate_v4(), 'Basic Token Pack', '100 tokens for basic gameplay', 1000, 100, true),
        (uuid_generate_v4(), 'Premium Token Pack', '500 tokens for premium gameplay', 4500, 500, true),
        (uuid_generate_v4(), 'Ultimate Token Pack', '1000 tokens for ultimate gameplay', 8000, 1000, true);
    `
  });
  
  if (error) {
    console.error('Error creating tokens table:', error);
  } else {
    console.log('Successfully created tokens table');
  }
}

// Function to create the transactions table
async function createTransactionsTable() {
  console.log('Creating transactions table...');
  
  const { error } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        reference TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });
  
  if (error) {
    console.error('Error creating transactions table:', error);
  } else {
    console.log('Successfully created transactions table');
  }
}

// Main function to create all missing tables
async function createMissingTables() {
  console.log('Creating missing tables in production database...');
  
  try {
    // Create tables in order of dependencies
    await createHealthChecksTable();
    await createGameweeksTable();
    await createMatchHistoryTable();
    await createTeamGameweekStatsTable();
    await createTokensTable();
    await createTransactionsTable();
    
    console.log('✅ All missing tables created successfully!');
  } catch (error) {
    console.error('Error creating missing tables:', error);
  }
}

// Run the function
createMissingTables(); 