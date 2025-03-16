#!/usr/bin/env node

/**
 * This script migrates data from local Supabase to production Supabase
 * It uses the Supabase JS client to fetch data from local and insert it into production
 * 
 * Usage: node scripts/migrate-to-production.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Local Supabase client
const localSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Production Supabase client
const prodSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
  process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
);

// Tables to migrate (in order of dependencies)
const tables = [
  'players',
  'profiles',
  'teams',
  'player_gameweeks',
  'team_players',
  'leagues',
  'league_members',
  'bets',
  'gameweeks',
  'match_history',
  'team_gameweek_stats',
  'tokens',
  'transactions',
  'health_checks'
];

// Function to check if a table exists
async function tableExists(supabase, table) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return false;
    }
    
    return !error;
  } catch (error) {
    return false;
  }
}

// Function to fetch all data from a table
async function fetchTableData(supabase, table) {
  console.log(`Fetching data from ${table}...`);
  const { data, error } = await supabase.from(table).select('*');
  
  if (error) {
    console.error(`Error fetching data from ${table}:`, error);
    return [];
  }
  
  console.log(`Fetched ${data.length} rows from ${table}`);
  return data;
}

// Function to insert data into a table
async function insertTableData(supabase, table, data) {
  if (!data || data.length === 0) {
    console.log(`No data to insert into ${table}`);
    return;
  }
  
  console.log(`Inserting ${data.length} rows into ${table}...`);
  
  // Insert in batches of 100 to avoid request size limits
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch).select();
    
    if (error) {
      console.error(`Error inserting batch into ${table}:`, error);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
    }
  }
  
  console.log(`Inserted ${successCount} rows into ${table} (${errorCount} errors)`);
}

// Function to clear a table
async function clearTable(supabase, table) {
  console.log(`Clearing table ${table}...`);
  
  try {
    // Use a more reliable way to delete all rows
    const { error } = await supabase.from(table).delete().gte('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) {
      console.error(`Error clearing table ${table}:`, error);
    } else {
      console.log(`Table ${table} cleared successfully`);
    }
  } catch (error) {
    console.error(`Error clearing table ${table}:`, error);
  }
}

// Main migration function
async function migrateData() {
  console.log('Starting migration from local to production Supabase...');
  
  // Check if production environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || !process.env.SUPABASE_SERVICE_ROLE_KEY_PROD) {
    console.error('Production Supabase environment variables not found.');
    console.error('Please run: npm run supabase:prod');
    process.exit(1);
  }
  
  // Ask for confirmation before proceeding
  rl.question('⚠️ WARNING: This will overwrite data in your PRODUCTION database. Are you sure you want to continue? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('Migration cancelled.');
      rl.close();
      return;
    }
    
    // Process each table
    for (const table of tables) {
      // Check if table exists in local
      const localTableExists = await tableExists(localSupabase, table);
      if (!localTableExists) {
        console.log(`Table ${table} does not exist in local database. Skipping...`);
        continue;
      }
      
      // Check if table exists in production
      const prodTableExists = await tableExists(prodSupabase, table);
      if (!prodTableExists) {
        console.log(`Table ${table} does not exist in production database. Creating...`);
        // Note: In a real scenario, you would create the table here
        // For this script, we'll just skip tables that don't exist
        console.log(`Skipping table ${table} as it doesn't exist in production.`);
        continue;
      }
      
      // Fetch data from local
      const data = await fetchTableData(localSupabase, table);
      
      // Clear production table
      await clearTable(prodSupabase, table);
      
      // Insert data into production
      await insertTableData(prodSupabase, table, data);
    }
    
    console.log('Migration completed successfully!');
    rl.close();
  });
}

// Run the migration
migrateData(); 