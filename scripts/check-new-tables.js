#!/usr/bin/env node

/**
 * This script checks if the new tables for league pricing and prize distribution exist
 * 
 * Usage: node scripts/check-new-tables.js
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

async function checkNewTables() {
  console.log('Checking new tables in local Supabase instance...');
  
  try {
    // Try to query each table that we expect to exist
    const tables = [
      'league_pricing',
      'league_prize_distribution',
      'prize_distribution_templates',
      'league_settings'
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
          if (data && data.length > 0) {
            console.log(`   Sample data: ${JSON.stringify(data[0])}`);
          } else {
            console.log(`   Table is empty`);
          }
        }
      } catch (error) {
        console.log(`❌ Error checking table '${table}': ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkNewTables().catch(console.error); 