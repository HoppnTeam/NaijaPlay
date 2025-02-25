#!/usr/bin/env node

/**
 * This script checks what tables are available in the local Supabase instance
 * 
 * Usage: node scripts/check-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Local Supabase client
const localSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('Checking tables in local Supabase instance...');
  
  try {
    // Try to query each table that we expect to exist
    const tables = [
      'profiles',
      'players',
      'teams',
      'team_players',
      'leagues',
      'league_members',
      'gameweeks',
      'matches',
      'match_events',
      'team_gameweek_stats',
      'player_gameweek_stats',
      'tokens',
      'token_transactions',
      'user_tokens'
    ];
    
    console.log('Checking if tables exist:');
    
    for (const table of tables) {
      try {
        const { data, error } = await localSupabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' does not exist or is not accessible: ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${table}': ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTables().catch(console.error); 